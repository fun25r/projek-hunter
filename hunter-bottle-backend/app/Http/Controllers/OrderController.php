<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Service\BiteshipService;
use App\Service\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    private BiteshipService $biteship;
    private MidtransService $midtrans;

    public function __construct(BiteshipService $biteship, MidtransService $midtrans)
    {
        $this->biteship = $biteship;
        $this->midtrans = $midtrans;
    }

    /**
     * GET /api/shipping/cost
     * Menerima kurir + alamat tujuan, hitung tarif Biteship,
     * kembalikan JSON berformat mirip RajaOngkir agar frontend tidak pecah.
     */
    public function getInstantShippingCost(Request $request)
    {
        $request->validate([
            'courier'           => 'required|string',
            'destination_lat'   => 'required|numeric',
            'destination_lng'   => 'required|numeric',
            'weight'            => 'required|integer|min:1',
            'value'             => 'numeric|min:0',
        ]);

        try {
            $rates = $this->biteship->getInstantExpressRates([
                'courier'   => $request->courier,
                'latitude'  => $request->destination_lat,
                'longitude' => $request->destination_lng,
                'weight'    => $request->weight,
                'value'     => $request->value ?? 100000,
            ]);

            $formatted = [];
            foreach ($rates['results'] as $r) {
                $formatted[] = [
                    'service'     => $r['service'],
                    'description' => $r['description'] ?? $r['service'],
                    'cost'        => [
                        ['value' => $r['cost'], 'etd' => $r['etd'] ?? '', 'note' => '']
                    ],
                ];
            }

            return response()->json([
                'rajaongkir' => [
                    'query'              => [
                        'courier' => $request->courier,
                        'origin'  => 'Cikupa, Tangerang',
                    ],
                    'origin_details'     => [
                        'city_name' => 'Tangerang',
                        'province'  => 'Banten',
                    ],
                    'destination_details'=> [],
                    'results'            => [
                        [
                            'code'  => strtolower($request->courier),
                            'name'  => strtoupper($request->courier),
                            'costs' => $formatted,
                        ],
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghitung ongkir: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * POST /api/orders
     * Checkout — DB::transaction() + lockForUpdate() + decrement stok.
     * Hitung ulang ongkir via Biteship di sisi server untuk cegah manipulasi.
     */
    public function store(Request $request)
    {
        $request->validate([
            'customer_name'       => 'required|string|max:255',
            'customer_email'      => 'required|email|max:255',
            'customer_phone'      => 'required|string|max:20',
            'delivery_type'       => 'required|in:pickup,shipping',
            'shipping_address'    => 'required_if:delivery_type,shipping|nullable|string|max:500',
            'destination_lat'     => 'nullable|numeric',
            'destination_lng'     => 'nullable|numeric',
            'courier'             => 'nullable|string|max:50',
            'courier_service'     => 'nullable|string|max:100',
            'delivery_fee'        => 'nullable|integer|min:0',
            'order_note'          => 'nullable|string|max:500',
            'items'               => 'required|array|min:1',
            'items.*.product_id'  => 'required|integer|exists:products,id',
            'items.*.quantity'    => 'required|integer|min:1|max:99',
        ]);

        try {
            $order = DB::transaction(function () use ($request) {
                $subtotal = 0;
                $totalWeight = 0;
                $orderItemsData = [];

                foreach ($request->items as $item) {
                    $product = Product::where('id', $item['product_id'])
                        ->lockForUpdate()
                        ->firstOrFail();

                    if ($product->stock_count < $item['quantity']) {
                        throw new \Exception("Stok {$product->name} tidak mencukupi.");
                    }

                    $product->decrement('stock_count', $item['quantity']);

                    if ($product->stock_count <= 0) {
                        $product->update(['stock_status' => 'out_of_stock']);
                    } elseif ($product->stock_count <= 5) {
                        $product->update(['stock_status' => 'low_stock']);
                    }

                    $itemSubtotal = $product->price * $item['quantity'];
                    $itemWeight = $product->weight_gram * $item['quantity'];

                    $subtotal += $itemSubtotal;
                    $totalWeight += $itemWeight;

                    $orderItemsData[] = [
                        'product_id'    => $product->id,
                        'product_name'  => $product->name,
                        'product_price' => $product->price,
                        'quantity'      => $item['quantity'],
                        'weight_gram'   => $itemWeight,
                        'subtotal'      => $itemSubtotal,
                        'note'          => $item['note'] ?? null,
                    ];
                }

                $deliveryFee = 0;
                if ($request->delivery_type === 'shipping' && $request->destination_lat && $request->destination_lng) {
                    $deliveryFee = $this->biteship->getLowestPrice([
                        'courier'   => $request->courier ?? '',
                        'latitude'  => $request->destination_lat,
                        'longitude' => $request->destination_lng,
                        'weight'    => $totalWeight,
                        'value'     => (int) $subtotal,
                    ]);
                }

                $totalAmount = $subtotal + $deliveryFee;

                $orderNumber = 'HB-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));

                $order = Order::create([
                    'order_number'      => $orderNumber,
                    'customer_name'     => $request->customer_name,
                    'customer_email'    => $request->customer_email,
                    'customer_phone'    => $request->customer_phone,
                    'delivery_type'     => $request->delivery_type,
                    'shipping_address'  => $request->shipping_address,
                    'province'          => $request->province ?? null,
                    'city'              => $request->city ?? null,
                    'subdistrict'       => $request->subdistrict ?? null,
                    'postal_code'       => $request->postal_code ?? null,
                    'courier'           => $request->courier,
                    'courier_service'   => $request->courier_service,
                    'shipping_cost'     => $deliveryFee,
                    'total_weight_gram' => $totalWeight,
                    'subtotal'          => $subtotal,
                    'total_amount'      => $totalAmount,
                    'order_note'        => $request->order_note,
                    'payment_method'    => $request->delivery_type === 'pickup' ? 'cod' : 'qris',
                    'payment_status'    => 'pending',
                    'order_status'      => 'pending',
                ]);

                foreach ($orderItemsData as $itemData) {
                    $order->items()->create($itemData);
                }

                if ($request->delivery_type === 'shipping') {
                    $snap = $this->midtrans->createSnapInvoice([
                        'order_number'  => $orderNumber,
                        'total_amount'  => (int) $totalAmount,
                        'customer_name' => $request->customer_name,
                        'customer_email'=> $request->customer_email,
                        'customer_phone'=> $request->customer_phone,
                        'delivery_fee'  => (int) $deliveryFee,
                        'items'         => $orderItemsData,
                    ]);

                    $order->update([
                        'midtrans_snap_token'   => $snap['token'],
                        'midtrans_redirect_url' => $snap['redirect_url'],
                    ]);
                }

                return $order->load('items');
            });

            return response()->json([
                'message' => 'Pesanan berhasil dibuat',
                'order'   => $order,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * GET /api/orders/{orderNumber}
     */
    public function show(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with('items')
            ->firstOrFail();

        return response()->json([
            'order'           => $order,
            'store_whatsapp'  => config('services.store.whatsapp_number'),
            'store_name'      => config('services.store.name'),
        ]);
    }

    /**
     * GET /api/admin/orders
     * Menampilkan semua pesanan untuk admin (urut terbaru), paginasi 20.
     */
    public function adminOrders(Request $request)
    {
        $orders = Order::with('items')
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json($orders);
    }

    /**
     * PATCH /api/admin/orders/{id}/status
     * Admin mengubah status pesanan secara inline.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'order_status' => 'required|in:pending,confirmed,processing,shipped,delivered,canceled',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['order_status' => $request->order_status]);

        return response()->json([
            'message' => 'Status berhasil diperbarui',
            'order'   => $order->fresh()->load('items'),
        ]);
    }

    /**
     * GET /api/admin/reports
     * Laporan penjualan berdasarkan rentang tanggal.
     * Hanya pesanan berstatus PAID yang dihitung.
     */
    public function adminSalesReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date . ' 00:00:00';
        $endDate   = $request->end_date . ' 23:59:59';

        $paidOrders = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $totalRevenue = $paidOrders->sum('total_amount');
        $totalTransactions = $paidOrders->count();

        $totalQty = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->sum('order_items.quantity');

        $productBreakdown = DB::table('order_items')
            ->select(
                'order_items.product_name',
                DB::raw('SUM(order_items.quantity) as total_qty'),
                DB::raw('SUM(order_items.subtotal) as total_sales')
            )
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->groupBy('order_items.product_name')
            ->orderByDesc('total_sales')
            ->get();

        return response()->json([
            'summary' => [
                'total_revenue'       => (int) $totalRevenue,
                'total_qty'           => (int) $totalQty,
                'total_transactions'  => $totalTransactions,
            ],
            'products' => $productBreakdown,
            'filters'  => [
                'start_date' => $request->start_date,
                'end_date'   => $request->end_date,
            ],
        ]);
    }

    /**
     * POST /api/orders/snap-token
     * Generate Snap token untuk Midtrans popup (digunakan frontend).
     */
    public function getSnapToken(Request $request)
    {
        $request->validate([
            'order_number'  => 'required|string',
            'amount'        => 'required|numeric',
            'customer_name' => 'required|string',
            'customer_email'=> 'required|email',
            'customer_phone'=> 'required|string',
        ]);

        $snap = $this->midtrans->getSnapToken([
            'transaction_details' => [
                'order_id'     => $request->order_number,
                'gross_amount' => (int) $request->amount,
            ],
            'customer_details' => [
                'first_name' => $request->customer_name,
                'email'      => $request->customer_email,
                'phone'      => $request->customer_phone,
            ],
            'enabled_payments' => ['qris', 'gopay', 'shopeepay', 'bank_transfer'],
            'callbacks' => [
                'finish' => config('services.xendit.success_redirect_url'),
            ],
        ]);

        return response()->json($snap);
    }

    /**
     * GET /api/orders/track/{orderNumber}
     * Public tracking tanpa login.
     */
    public function track(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with('items')
            ->first();

        if (!$order) {
            return response()->json([
                'found'   => false,
                'message' => 'Nomor pesanan tidak ditemukan.',
            ], 404);
        }

        $paymentLabel = match ($order->payment_status) {
            'paid'    => 'Sudah Dibayar',
            'pending' => 'Menunggu Pembayaran',
            'expired' => 'Kedaluwarsa',
            'failed'  => 'Gagal',
            default   => 'Belum Dibayar',
        };

        $orderLabel = match ($order->order_status) {
            'pending'    => 'Menunggu Konfirmasi',
            'confirmed'  => 'Dikonfirmasi',
            'processing' => 'Sedang Diproses',
            'shipped'    => 'Dikirim',
            'delivered'  => 'Selesai',
            'canceled'   => 'Dibatalkan',
            default      => 'Menunggu',
        };

        return response()->json([
            'found'          => true,
            'order_number'   => $order->order_number,
            'customer_name'  => $order->customer_name,
            'payment_method' => $order->payment_method === 'qris' ? 'QRIS' : 'COD',
            'payment_status' => $order->payment_status,
            'payment_label'  => $paymentLabel,
            'order_status'   => $order->order_status,
            'order_label'    => $orderLabel,
            'delivery_type'  => $order->delivery_type,
            'courier'        => $order->courier ? strtoupper($order->courier) : null,
            'resi_number'    => $order->resi_number,
            'shipping_address'=> $order->shipping_address,
            'total_amount'   => $order->total_amount,
            'items'          => $order->items->map(fn($i) => [
                'name'     => $i->product_name,
                'quantity' => $i->quantity,
                'price'    => $i->product_price,
            ]),
            'created_at'     => $order->created_at->format('d M Y H:i'),
        ]);
    }
}
