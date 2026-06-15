<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('resi_number')->nullable()->after('courier_service');
            $table->string('tracking_status')->nullable()->after('order_status');
            $table->string('midtrans_transaction_id')->nullable()->after('xendit_invoice_url');
            $table->string('midtrans_payment_type')->nullable()->after('midtrans_transaction_id');
            $table->string('midtrans_transaction_status')->nullable()->after('midtrans_payment_type');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['resi_number', 'tracking_status', 'midtrans_transaction_id', 'midtrans_payment_type', 'midtrans_transaction_status']);
        });
    }
};
