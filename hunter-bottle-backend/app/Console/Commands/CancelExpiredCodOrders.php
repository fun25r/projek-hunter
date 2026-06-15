<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;

class CancelExpiredCodOrders extends Command
{
    protected $signature = 'orders:cancel-expired-cod';
    protected $description = 'Auto-cancel COD orders not picked up within 24 hours of ready notification';

    public function handle(): void
    {
        $expired = Order::where('payment_method', 'cod')
            ->where('order_status', 'delivered')
            ->whereNotNull('auto_cancel_at')
            ->where('auto_cancel_at', '<=', now())
            ->get();

        foreach ($expired as $order) {
            $order->update(['order_status' => 'canceled']);
            // Restock items
            foreach ($order->items as $item) {
                $item->product->increment('stock_count', $item->quantity);
            }
            $this->info("Order {$order->order_number} auto-canceled — stock returned.");
        }

        $this->info("Done. {$expired->count()} orders canceled.");
    }
}
