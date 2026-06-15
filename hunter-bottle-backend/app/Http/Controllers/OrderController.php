<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Service\XenditService;
use App\Service\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    private XenditService $xendit;

    public function __construct(XenditService $xendit)
    {
        $this->xendit = $xendit;
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_name'       => 'required|string|max:255',
            'customer_email'      => 'required|email|max:255',
            'customer_phone'      => 'required|string|max:20',
            'delivery_type'       => 'required|in:pickup,shipping',
            'shipping_address'    => 'required_if:delivery_type,shipping|nullable|string',
            'province'            => 'required_if:delivery_type,shipping|nullable|string',
            'city'                => 'required_if:delivery_type,shipping|nullable|string',
            'subdistrict'         => 'nullable|string',
            'postal_code'         => 'nullable|string|max:10',
            'courier'             => 'nullable|string',
            'courier_service'     => 'nullable|string',
            'shipping_cost'       => 'nullable|numeric|min:0',
            'payment_method'      => 'required|in:cod,qris',
            'order_note'          => 'nullable|string',
            'items'               => 'required|array|min:1',
            'items.*.product_id'  => 'required|integer|exists:products,id',
            'items.*.quantity'    => 'required|integer|min:1|max:99',
            'items.*.note'        => 'nullable|string',
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

                $shippingCost = $request->shipping_cost ?? 0;
                $totalAmount = $subtotal + $shippingCost;

                $orderNumber = 'HB-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));

                $order = Order::create([
                    'order_number'      => $orderNumber,
                    'customer_name'     => $request->customer_name,
                    'customer_email'    => $request->customer_email,
                    'customer_phone'    => $request->customer_phone,
                    'delivery_type'     => $request->delivery_type,
                    'shipping_address'  => $request->shipping_address,
                    'province'          => $request->province,
                    'city'              => $request->city,
                    'subdistrict'       => $request->subdistrict,
                    'postal_code'       => $request->postal_code,
                    'courier'           => $request->courier,
                    'courier_service'   => $request->courier_service,
                    'shipping_cost'     => $shippingCost,
                    'total_weight_gram' => $totalWeight,
                    'subtotal'          => $subtotal,
                    'total_amount'      => $totalAmount,
                    'order_note'        => $request->order_note,
                    'payment_method'    => $request->payment_method,
                    'payment_status'    => 'pending',
                    'order_status'      => 'pending',
                ]);

                foreach ($orderItemsData as $itemData) {
                    $order->items()->create($itemData);
                }

                if ($request->payment_method === 'qris') {
                    $xenditResponse = $this->xendit->createInvoice([
                        'external_id'          => $orderNumber,
                        'amount'               => $totalAmount,
                        'description'          => "Hunter Bottle Order #{$orderNumber}",
                        'payer_email'          => $request->customer_email,
                        'payment_methods'      => ['QRIS'],
                        'success_redirect_url' => config('services.xendit.success_redirect_url'),
                        'failure_redirect_url' => config('services.xendit.failure_redirect_url'),
                    ]);

                    $order->update([
                        'xendit_invoice_id'  => $xenditResponse['id'] ?? null,
                        'xendit_invoice_url' => $xenditResponse['invoice_url'] ?? null,
                        'xendit_expires_at'  => isset($xenditResponse['expiry_date'])
                            ? now()->parse($xenditResponse['expiry_date'])
                            : null,
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
     * Generate Snap token untuk Midtrans popup
     */
    public function getSnapToken(Request $request)
    {
        $request->validate([
            'order_number' => 'required|string',
            'amount'       => 'required|numeric',
            'customer_name'=> 'required|string',
            'customer_email'=> 'required|email',
            'customer_phone'=> 'required|string',
        ]);

        $midtrans = new MidtransService();
        $snap = $midtrans->getSnapToken([
            'transaction_details' => [
                'order_id'     => $request->order_number,
                'gross_amount' => (int) $request->amount,
            ],
            'customer_details' => [
                'first_name' => $request->customer_name,
                'email'      => $request->customer_email,
                'phone'      => $request->customer_phone,
            ],
            'callbacks' => [
                'finish' => config('services.xendit.success_redirect_url'),
            ],
        ]);

        return response()->json($snap);
    }

    /**
     * Public tracking — cari order berdasarkan nomor pesanan (tanpa login)
     */
    public function track(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with('items')
            ->first();

        if (! $order) {
            return response()->json([
                'found'   => false,
                'message' => 'Nomor pesanan tidak ditemukan. Periksa kembali nomor pesanan Anda.',
            ], 404);
        }

        // Map status ke bahasa yang mudah dipahami customer
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
