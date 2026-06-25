<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'customer_name', 'customer_email', 'customer_phone',
        'delivery_type', 'shipping_address',
        'province', 'city', 'subdistrict', 'postal_code',
        'courier', 'courier_service', 'shipping_cost', 'total_weight_gram',
        'subtotal', 'total_amount', 'order_note',
        'payment_method', 'payment_status', 'order_status',
        'xendit_invoice_id', 'xendit_invoice_url', 'xendit_expires_at',
        'midtrans_transaction_id', 'midtrans_payment_type', 'midtrans_transaction_status',
        'midtrans_snap_token', 'midtrans_redirect_url',
        'resi_number', 'tracking_status',
        'ready_at', 'picked_up_at', 'auto_cancel_at',
    ];

    protected function casts(): array
    {
        return [
            'shipping_cost' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'xendit_expires_at' => 'datetime',
            'ready_at' => 'datetime',
            'picked_up_at' => 'datetime',
            'auto_cancel_at' => 'datetime',
        ];
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
