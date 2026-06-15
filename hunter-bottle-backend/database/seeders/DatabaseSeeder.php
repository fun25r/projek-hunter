<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Banner;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Admin::create([
            'name' => 'Admin Hunter Bottle',
            'email' => 'admin@hunterbottle.com',
            'password' => Hash::make('HunterAdmin2024!'),
            'role' => 'admin',
        ]);

        Admin::create([
            'name' => 'Kasir Hunter Bottle',
            'email' => 'kasir@hunterbottle.com',
            'password' => Hash::make('HunterKasir2024!'),
            'role' => 'kasirhunterbottle',
        ]);

        $products = [
            [
                'name' => 'Chateau Margaux 2018',
                'slug' => 'chateau-margaux-2018',
                'category' => 'Red Wine',
                'subcategory' => 'Bordeaux',
                'description' => 'Anggur merah premium dari Bordeaux, Prancis. Aroma kompleks dengan sentuhan blackcurrant dan vanilla.',
                'price' => 15000000,
                'stock_status' => 'in_stock',
                'stock_count' => 10,
                'abv' => 13.50,
                'origin' => 'Bordeaux, Prancis',
                'weight_gram' => 1500,
                'is_featured' => true,
                'is_bestseller' => false,
                'is_new_collection' => false,
                'discount_percent' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Moet & Chandon Imperial',
                'slug' => 'moet-chandon-imperial',
                'category' => 'Champagne',
                'subcategory' => 'Brut',
                'description' => 'Champagne ikonik dengan keseimbangan sempurna antara keanggunan dan kecerahan rasa buah.',
                'price' => 1200000,
                'stock_status' => 'in_stock',
                'stock_count' => 25,
                'abv' => 12.00,
                'origin' => 'Champagne, Prancis',
                'weight_gram' => 1500,
                'is_featured' => false,
                'is_bestseller' => true,
                'is_new_collection' => false,
                'discount_percent' => 10,
                'is_active' => true,
            ],
            [
                'name' => 'Johnnie Walker Blue Label',
                'slug' => 'johnnie-walker-blue-label',
                'category' => 'Whisky',
                'subcategory' => 'Blended',
                'description' => 'Whisky legendaris dengan karakter lembut dan mendalam, dibuat dari cask pilihan yang langka.',
                'price' => 4500000,
                'stock_status' => 'low_stock',
                'stock_count' => 5,
                'abv' => 40.00,
                'origin' => 'Skotlandia',
                'weight_gram' => 1200,
                'is_featured' => true,
                'is_bestseller' => true,
                'is_new_collection' => false,
                'discount_percent' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        $banners = [
            [
                'title' => 'Koleksi Premium Wine',
                'subtitle' => 'Temukan anggur terbaik dari seluruh dunia',
                'image_url' => '',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Diskon Spesial Akhir Pekan',
                'subtitle' => 'Nikmati potongan 10% untuk Champagne pilihan',
                'image_url' => '',
                'sort_order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $banner) {
            Banner::create($banner);
        }
    }
}
