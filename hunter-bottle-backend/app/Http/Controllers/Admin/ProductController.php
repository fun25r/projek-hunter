<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Service\FirebaseStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    private FirebaseStorageService $firebaseStorage;

    public function __construct(FirebaseStorageService $firebaseStorage)
    {
        $this->firebaseStorage = $firebaseStorage;
    }

    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        return response()->json(
            $query->latest()->paginate(20)
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'             => 'required|string|max:255',
            'category'         => 'nullable|string|max:100',
            'subcategory'      => 'nullable|string|max:100',
            'description'      => 'nullable|string',
            'price'            => 'required|numeric|min:0',
            'image'            => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'stock_count'      => 'required|integer|min:0',
            'abv'              => 'nullable|numeric|min:0|max:100',
            'origin'           => 'nullable|string|max:255',
            'weight_gram'      => 'nullable|integer|min:1',
            'discount_percent' => 'nullable|integer|min:0|max:100',
            'is_featured'      => 'nullable|boolean',
            'is_bestseller'    => 'nullable|boolean',
            'is_new_collection'=> 'nullable|boolean',
            'is_active'        => 'nullable|boolean',
            'discount_expires_at'       => 'nullable|date',
            'new_collection_expires_at' => 'nullable|date',
        ]);

        $data = $request->except('image');

        $data['slug'] = Str::slug($request->name) . '-' . Str::random(4);

        try {
            if ($request->hasFile('image')) {
                $data['image_url'] = $this->firebaseStorage->upload(
                    $request->file('image'),
                    'products'
                );
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengupload gambar ke Firebase Storage.',
                'error'   => $e->getMessage(),
            ], 500);
        }

        $data['stock_status'] = match (true) {
            $data['stock_count'] <= 0 => 'out_of_stock',
            $data['stock_count'] <= 5 => 'low_stock',
            default => 'in_stock',
        };

        $product = Product::create($data);

        return response()->json([
            'message' => 'Produk berhasil dibuat',
            'product' => $product,
        ], 201);
    }

    public function show(string $id)
    {
        return response()->json(Product::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name'             => 'sometimes|required|string|max:255',
            'category'         => 'nullable|string|max:100',
            'subcategory'      => 'nullable|string|max:100',
            'description'      => 'nullable|string',
            'price'            => 'sometimes|required|numeric|min:0',
            'image'            => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'stock_count'      => 'sometimes|required|integer|min:0',
            'abv'              => 'nullable|numeric|min:0|max:100',
            'origin'           => 'nullable|string|max:255',
            'weight_gram'      => 'nullable|integer|min:1',
            'discount_percent' => 'nullable|integer|min:0|max:100',
            'is_featured'      => 'nullable|boolean',
            'is_bestseller'    => 'nullable|boolean',
            'is_new_collection'=> 'nullable|boolean',
            'is_active'        => 'nullable|boolean',
            'discount_expires_at'       => 'nullable|date',
            'new_collection_expires_at' => 'nullable|date',
        ]);

        $data = $request->except('image');

        if ($request->has('name') && $request->name !== $product->name) {
            $data['slug'] = Str::slug($request->name) . '-' . Str::random(4);
        }

        if ($request->hasFile('image')) {
            try {
                if ($product->image_url) {
                    $this->firebaseStorage->deleteByUrl($product->image_url);
                }
                $data['image_url'] = $this->firebaseStorage->upload(
                    $request->file('image'),
                    'products'
                );
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Gagal mengupload gambar ke Firebase Storage.',
                    'error'   => $e->getMessage(),
                ], 500);
            }
        }

        if ($request->has('stock_count')) {
            $data['stock_status'] = match (true) {
                $data['stock_count'] <= 0 => 'out_of_stock',
                $data['stock_count'] <= 5 => 'low_stock',
                default => 'in_stock',
            };
        }

        $product->update($data);

        return response()->json([
            'message' => 'Produk berhasil diupdate',
            'product' => $product->fresh(),
        ]);
    }

    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);

        if ($product->image_url) {
            try {
                $this->firebaseStorage->deleteByUrl($product->image_url);
            } catch (\Exception $e) {
            }
        }

        $product->delete();

        return response()->json(['message' => 'Produk berhasil dihapus']);
    }
}
