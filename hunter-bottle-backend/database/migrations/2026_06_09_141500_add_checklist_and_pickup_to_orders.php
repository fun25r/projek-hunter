<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('ready_at')->nullable()->after('xendit_expires_at');
            $table->timestamp('picked_up_at')->nullable()->after('ready_at');
            $table->timestamp('auto_cancel_at')->nullable()->after('picked_up_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['ready_at', 'picked_up_at', 'auto_cancel_at']);
        });
    }
};
