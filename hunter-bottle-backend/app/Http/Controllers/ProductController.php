<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()->where('is_active', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('subcategory')) {
            $query->where('subcategory', $request->subcategory);
        }

        if ($request->filled('tab')) {
            match ($request->tab) {
                'bestseller' => $query->where('is_bestseller', true),
                'featured'   => $query->where('is_featured', true),
                'new'        => $query->where('is_new_collection', true),
                default      => null,
            };
        }

        return response()->json(
            $query->latest()->paginate(12)
        );
    }

    public function show(Product $product)
    {
        if (! $product->is_active) {
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
        }

        return response()->json($product);
    }

    public function recommendations()
    {
        $products = Product::where('is_active', true)
            ->where(function ($q) {
                $q->where('is_featured', true)
                  ->orWhere('discount_percent', '>', 0);
            })
            ->latest()
            ->limit(8)
            ->get();

        return response()->json($products);
    }
}
