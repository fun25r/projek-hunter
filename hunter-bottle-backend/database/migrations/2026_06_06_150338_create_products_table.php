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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category')->nullable();
            $table->string('subcategory')->nullable();
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->string('image_url')->nullable();
            $table->enum('stock_status', ['in_stock', 'low_stock', 'out_of_stock'])->default('in_stock');
            $table->integer('stock_count')->default(0);
            $table->decimal('abv', 5, 2)->nullable();
            $table->string('origin')->nullable();
            $table->integer('weight_gram')->default(1000);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_bestseller')->default(false);
            $table->boolean('is_new_collection')->default(false);
            $table->integer('discount_percent')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
