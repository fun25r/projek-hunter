<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShippingController;
use App\Http\Controllers\WebhookController;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// =============================================
// PUBLIC ENDPOINTS
// =============================================

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/recommendations', [ProductController::class, 'recommendations']);
Route::get('/products/{product}', [ProductController::class, 'show']);

Route::get('/banners', function () {
    return response()->json(
        Banner::where('is_active', true)->orderBy('sort_order')->get()
    );
});

// Shipping — Biteship-based (format response mirip RajaOngkir)
Route::post('/shipping/cost', [OrderController::class, 'getInstantShippingCost']);

// Order
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
Route::post('/orders/snap-token', [OrderController::class, 'getSnapToken']);

// Public tracking
Route::get('/orders/track/{orderNumber}', [OrderController::class, 'track']);

// Webhooks
Route::post('/webhooks/midtrans', [WebhookController::class, 'midtrans']);
Route::post('/webhooks/xendit', [WebhookController::class, 'xendit']);

// =============================================
// ADMIN AUTH
// =============================================

Route::match(['get', 'post'], '/admin/login', [\App\Http\Controllers\Admin\AuthController::class, 'login']);

// =============================================
// ADMIN PROTECTED ROUTES (auth:sanctum + admin middleware)
// =============================================

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/admin/logout', [\App\Http\Controllers\Admin\AuthController::class, 'logout']);
    Route::get('/admin/me', [\App\Http\Controllers\Admin\AuthController::class, 'me']);

    // Products CRUD
    Route::get('/admin/products', [\App\Http\Controllers\Admin\ProductController::class, 'index']);
    Route::post('/admin/products', [\App\Http\Controllers\Admin\ProductController::class, 'store']);
    Route::get('/admin/products/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'show']);
    Route::post('/admin/products/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'update']);
    Route::put('/admin/products/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'update']);
    Route::delete('/admin/products/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'destroy']);

    // Product Tags
    Route::patch('/admin/products/{product}/tags', function (\App\Models\Product $product, Request $request) {
        $request->validate(['field' => 'required|in:is_new_collection,is_bestseller,is_featured']);
        $product->update([$request->field => !$product->{$request->field}]);
        return response()->json(['message' => 'Tag updated', 'product' => $product->fresh()]);
    });

    // Banners CRUD
    Route::get('/admin/banners', [\App\Http\Controllers\Admin\BannerController::class, 'index']);
    Route::post('/admin/banners', [\App\Http\Controllers\Admin\BannerController::class, 'store']);
    Route::post('/admin/banners/{banner}', [\App\Http\Controllers\Admin\BannerController::class, 'update']);
    Route::put('/admin/banners/{banner}', [\App\Http\Controllers\Admin\BannerController::class, 'update']);
    Route::delete('/admin/banners/{banner}', [\App\Http\Controllers\Admin\BannerController::class, 'destroy']);

    // Orders — Admin
    Route::get('/admin/orders', [OrderController::class, 'adminOrders']);
    Route::patch('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Admin — update resi & tracking (closure untuk kompatibilitas)
    Route::patch('/admin/orders/{order}/tracking', function (\App\Models\Order $order, Request $request) {
        $request->validate([
            'resi_number'     => 'nullable|string|max:50',
            'tracking_status' => 'nullable|string|max:50',
        ]);
        $order->update($request->only(['resi_number', 'tracking_status']));
        return response()->json(['message' => 'Tracking updated', 'order' => $order->fresh()]);
    });

    // COD Payment — mark as paid
    Route::patch('/admin/orders/{order}/mark-paid', function (\App\Models\Order $order) {
        if ($order->payment_method !== 'cod') {
            return response()->json(['message' => 'Only COD orders can be marked paid'], 422);
        }
        $order->update(['payment_status' => 'paid', 'order_status' => 'confirmed']);
        return response()->json(['message' => 'Pembayaran COD dikonfirmasi', 'order' => $order->fresh()]);
    });

    // Toggle item checklist
    Route::patch('/admin/orders/{order}/items/{item}/check', function (\App\Models\Order $order, \App\Models\OrderItem $item) {
        if ($item->order_id !== $order->id) return response()->json(['message' => 'Item tidak valid'], 400);
        $item->update(['is_checked' => !$item->is_checked]);
        return response()->json(['message' => 'OK', 'item' => $item->fresh()]);
    });

    // Mark order as ready for pickup
    Route::patch('/admin/orders/{order}/mark-ready', function (\App\Models\Order $order) {
        $allChecked = $order->items()->where('is_checked', false)->count() === 0;
        if (!$allChecked) return response()->json(['message' => 'Semua item harus dicentang dahulu'], 422);
        $order->update([
            'order_status'   => 'delivered',
            'ready_at'       => now(),
            'auto_cancel_at' => $order->payment_method === 'cod' ? now()->addHours(24) : null,
        ]);
        return response()->json(['message' => 'Pesanan siap diambil', 'order' => $order->fresh()]);
    });

    // Reports — Admin Sales Report
    Route::get('/admin/reports', [OrderController::class, 'adminSalesReport']);

    // Analytics
    Route::get('/admin/analytics', [\App\Http\Controllers\Admin\AnalyticsController::class, 'dashboard']);
    Route::post('/admin/analytics/calculate-bestsellers', [\App\Http\Controllers\Admin\AnalyticsController::class, 'calculateBestsellers']);
});
