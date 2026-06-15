<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function index()
    {
        return response()->json(
            Banner::orderBy('sort_order')->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'     => 'required|string|max:255',
            'subtitle'  => 'nullable|string|max:255',
            'image'     => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'link_url'  => 'nullable|string|max:255',
            'sort_order'=> 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'expires_at'=> 'nullable|date',
        ]);

        $data = $request->except('image');
        if ($request->hasFile('image')) {
            $data['image_url'] = $request->file('image')->store('banners', 'public');
        }

        $banner = Banner::create($data);
        return response()->json(['message' => 'Banner dibuat', 'banner' => $banner], 201);
    }

    public function update(Request $request, Banner $banner)
    {
        $request->validate([
            'title'     => 'sometimes|required|string|max:255',
            'subtitle'  => 'nullable|string|max:255',
            'image'     => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'link_url'  => 'nullable|string|max:255',
            'sort_order'=> 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'expires_at'=> 'nullable|date',
        ]);

        $data = $request->except('image');
        if ($request->hasFile('image')) {
            if ($banner->image_url) {
                Storage::disk('public')->delete($banner->image_url);
            }
            $data['image_url'] = $request->file('image')->store('banners', 'public');
        }

        $banner->update($data);
        return response()->json(['message' => 'Banner diupdate', 'banner' => $banner->fresh()]);
    }

    public function destroy(Banner $banner)
    {
        if ($banner->image_url) {
            Storage::disk('public')->delete($banner->image_url);
        }
        $banner->delete();
        return response()->json(['message' => 'Banner dihapus']);
    }
}
