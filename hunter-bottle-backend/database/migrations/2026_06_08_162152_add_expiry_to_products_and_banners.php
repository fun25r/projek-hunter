<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->timestamp('discount_expires_at')->nullable()->after('discount_percent');
            $table->timestamp('new_collection_expires_at')->nullable()->after('is_new_collection');
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->timestamp('expires_at')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['discount_expires_at', 'new_collection_expires_at']);
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn('expires_at');
        });
    }
};
