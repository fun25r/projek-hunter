<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->enum('delivery_type', ['pickup', 'shipping']);
            $table->text('shipping_address')->nullable();
            $table->string('province')->nullable();
            $table->string('city')->nullable();
            $table->string('subdistrict')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('courier')->nullable();
            $table->string('courier_service')->nullable();
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->integer('total_weight_gram')->default(0);
            $table->decimal('subtotal', 12, 2);
            $table->decimal('total_amount', 12, 2);
            $table->text('order_note')->nullable();
            $table->enum('payment_method', ['cod', 'qris']);
            $table->enum('payment_status', ['pending', 'paid', 'expired', 'failed'])->default('pending');
            $table->enum('order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'canceled'])->default('pending');
            $table->string('xendit_invoice_id')->nullable();
            $table->string('xendit_invoice_url')->nullable();
            $table->timestamp('xendit_expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
