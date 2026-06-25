<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Service\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * POST /api/webhooks/midtrans
     * Menerima callback notifikasi dari Midtrans.
     * Validasi signature_key, update status order.
     * Jika expire/cancel/deny → kembalikan stok dengan increment().
     */
    public function midtrans(Request $request)
    {
        $payload = $request->all();
        $service = new MidtransService();

        if (!$service->verifySignature($payload)) {
            Log::warning('Midtrans webhook: invalid signature', [
                'order_id'      => $payload['order_id'] ?? 'unknown',
                'transaction_id'=> $payload['transaction_id'] ?? 'unknown',
            ]);
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $orderId = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? 'accept';
        $paymentType = $payload['payment_type'] ?? null;

        if (!$orderId || !$transactionStatus) {
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        $order = Order::where('order_number', $orderId)->first();
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->update([
            'midtrans_transaction_id'     => $payload['transaction_id'] ?? null,
            'midtrans_payment_type'       => $paymentType,
            'midtrans_transaction_status' => $transactionStatus,
        ]);

        if (in_array($transactionStatus, ['settlement', 'capture'])) {
            if ($fraudStatus === 'accept') {
                $order->update([
                    'payment_status' => 'paid',
                    'order_status'   => 'confirmed',
                ]);
                Log::info('Midtrans webhook: payment PAID', ['order' => $orderId]);
            }
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $order->update([
                'payment_status' => 'failed',
                'order_status'   => 'canceled',
            ]);

            foreach ($order->items as $item) {
                $product = $item->product;
                if ($product) {
                    $product->increment('stock_count', $item->quantity);
                    if ($product->stock_status === 'out_of_stock' && $product->stock_count > 0) {
                        $product->update(['stock_status' => 'in_stock']);
                    }
                }
            }
            Log::info('Midtrans webhook: order CANCELED/EXPIRED — stok dikembalikan', ['order' => $orderId]);
        } elseif ($transactionStatus === 'pending') {
            $order->update(['payment_status' => 'pending']);
        } elseif ($transactionStatus === 'failure') {
            $order->update(['payment_status' => 'failed']);
        }

        return response()->json(['message' => 'OK']);
    }

    /**
     * POST /api/webhooks/xendit
     * (Dipertahankan untuk backward compatibility)
     */
    public function xendit(Request $request)
    {
        $callbackToken = $request->header('x-callback-token');
        $expectedToken = config('services.xendit.webhook_token');

        if ($callbackToken !== $expectedToken) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $payload = $request->all();
        $externalId = $payload['external_id'] ?? null;
        $status = $payload['status'] ?? null;

        if (!$externalId || !$status) {
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        $order = Order::where('order_number', $externalId)->first();
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        match ($status) {
            'PAID'    => $this->handlePaid($order),
            'EXPIRED' => $this->handleExpired($order),
            'FAILED'  => $this->handleFailed($order),
            default   => null,
        };

        return response()->json(['message' => 'OK']);
    }

    private function handlePaid(Order $order): void
    {
        $order->update([
            'payment_status' => 'paid',
            'order_status'   => 'confirmed',
        ]);
    }

    private function handleExpired(Order $order): void
    {
        $order->update([
            'payment_status' => 'expired',
            'order_status'   => 'canceled',
        ]);

        foreach ($order->items as $item) {
            $product = $item->product;
            if ($product) {
                $product->increment('stock_count', $item->quantity);
                if ($product->stock_status === 'out_of_stock' && $product->stock_count > 0) {
                    $product->update(['stock_status' => 'in_stock']);
                }
            }
        }
    }

    private function handleFailed(Order $order): void
    {
        $order->update(['payment_status' => 'failed']);
    }
}
