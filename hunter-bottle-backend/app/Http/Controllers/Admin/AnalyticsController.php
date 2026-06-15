<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function dashboard(Request $request)
    {
        $period = $request->query('period', 'monthly'); // daily | weekly | monthly | annual
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        $productId = $request->query('product_id');

        $query = Order::query();

        if ($dateFrom) $query->whereDate('created_at', '>=', $dateFrom);
        if ($dateTo) $query->whereDate('created_at', '<=', $dateTo);
        if ($productId) {
            $query->whereHas('items', fn($q) => $q->where('product_id', $productId));
        }

        $groupFormat = match ($period) {
            'daily'   => 'DATE(created_at)',
            'weekly'  => "DATE(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY))",
            'annual'  => 'YEAR(created_at)',
            default   => "DATE_FORMAT(created_at, '%Y-%m')",
        };

        // Completed orders (non-cancelled)
        $completedQuery = (clone $query)->where('order_status', '!=', 'canceled');
        $cancelledQuery = (clone $query)->where('order_status', 'canceled');

        $summary = [
            'total_revenue'    => (int) (clone $completedQuery)->where('payment_status', 'paid')->sum('total_amount'),
            'total_orders'     => $completedQuery->count(),
            'cancelled_orders' => $cancelledQuery->count(),
            'cod_revenue'      => (int) (clone $completedQuery)->where('payment_method', 'cod')->where('payment_status', 'paid')->sum('total_amount'),
            'qris_revenue'     => (int) (clone $completedQuery)->where('payment_method', 'qris')->where('payment_status', 'paid')->sum('total_amount'),
            'avg_order_value'  => (int) (clone $completedQuery)->where('payment_status', 'paid')->avg('total_amount') ?? 0,
        ];

        // Revenue over time
        $revenueData = (clone $completedQuery)
            ->where('payment_status', 'paid')
            ->selectRaw("{$groupFormat} as period, SUM(total_amount) as revenue, COUNT(*) as order_count")
            ->groupBy(DB::raw($groupFormat))
            ->orderBy('period')
            ->get();

        // Top products
        $topProducts = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.order_status', '!=', 'canceled')
            ->when($dateFrom, fn($q) => $q->whereDate('orders.created_at', '>=', $dateFrom))
            ->when($dateTo, fn($q) => $q->whereDate('orders.created_at', '<=', $dateTo))
            ->selectRaw('product_id, product_name, SUM(quantity) as total_qty, SUM(order_items.subtotal) as total_sales')
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_sales')
            ->limit(10)
            ->get();

        return response()->json([
            'summary'     => $summary,
            'revenue_data'=> $revenueData,
            'top_products'=> $topProducts,
        ]);
    }

    // Auto-calculate bestsellers based on sales volume
    public function calculateBestsellers()
    {
        $topProductIds = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.order_status', '!=', 'canceled')
            ->selectRaw('product_id, SUM(quantity) as total_sold')
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->pluck('product_id');

        Product::query()->update(['is_bestseller' => false]);
        Product::whereIn('id', $topProductIds)->update(['is_bestseller' => true]);

        return response()->json([
            'message' => 'Bestseller tags updated',
            'bestseller_ids' => $topProductIds,
        ]);
    }
}
