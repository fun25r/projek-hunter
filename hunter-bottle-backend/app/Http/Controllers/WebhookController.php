<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Service\MidtransService;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
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

        if (! $externalId || ! $status) {
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        $order = Order::where('order_number', $externalId)->first();
        if (! $order) {
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
            $item->product->increment('stock_count', $item->quantity);
            if ($item->product->stock_status === 'out_of_stock' && $item->product->stock_count > 0) {
                $item->product->update(['stock_status' => 'in_stock']);
            }
        }
    }

    private function handleFailed(Order $order): void
    {
        $order->update(['payment_status' => 'failed']);
    }

    /**
     * Midtrans webhook — menerima notifikasi pembayaran dari Midtrans
     * Endpoint: POST /api/webhooks/midtrans
     */
    public function midtrans(Request $request)
    {
        $payload = $request->all();
        $service = new MidtransService();

        // Verifikasi signature key untuk keamanan
        if (! $service->verifySignature($payload)) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $orderId = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? null;

        $order = Order::where('order_number', $orderId)->first();
        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Update data Midtrans
        $order->update([
            'midtrans_transaction_id'     => $payload['transaction_id'] ?? null,
            'midtrans_payment_type'       => $payload['payment_type'] ?? null,
            'midtrans_transaction_status' => $transactionStatus,
        ]);

        // Map Midtrans status ke internal payment_status
        if (in_array($transactionStatus, ['settlement', 'capture'])) {
            if ($fraudStatus === 'accept') {
                $order->update(['payment_status' => 'paid', 'order_status' => 'confirmed']);
            }
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $order->update(['payment_status' => 'failed', 'order_status' => 'canceled']);
            // Kembalikan stok
            foreach ($order->items as $item) {
                $item->product->increment('stock_count', $item->quantity);
            }
        } elseif ($transactionStatus === 'pending') {
            $order->update(['payment_status' => 'pending']);
        }

        return response()->json(['message' => 'OK']);
    }
}
