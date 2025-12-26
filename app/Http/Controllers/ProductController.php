<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::withCount(['courses', 'purchases'])
            ->orderBy('order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/products', [
            'products' => $products,
        ]);
    }

    public function create()
    {
        $courses = Course::whereNull('product_id')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/products-form', [
            'courses' => $courses,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'affiliate_commission_rate' => 'nullable|numeric|min:0|max:100',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'type' => 'required|in:ecourse,ebook,template,affiliate_link',
            'file' => 'nullable|file|max:51200', // 50MB max
            'external_url' => 'nullable|url',
            'order' => 'nullable|integer',
            'status' => 'required|in:active,inactive',
            'is_default' => 'nullable|boolean',
            'is_lead_magnet' => 'nullable|boolean',
            'course_ids' => 'nullable|array',
            'course_ids.*' => 'exists:courses,id',
        ]);

        // Generate slug
        $validated['slug'] = Str::slug($validated['title']);
        
        // Ensure unique slug
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Product::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')->store('products/thumbnails', 'public');
        }

        // Handle file upload (for ebook/template)
        if ($request->hasFile('file')) {
            $validated['file_path'] = $request->file('file')->store('products/files', 'public');
        }

        // Handle is_default constraint - only one product can be default
        if (!empty($validated['is_default']) && $validated['is_default']) {
            Product::where('is_default', true)->update(['is_default' => false]);
        }

        // Handle is_lead_magnet constraint - only one product can be lead magnet
        if (!empty($validated['is_lead_magnet']) && $validated['is_lead_magnet']) {
            Product::where('is_lead_magnet', true)->update(['is_lead_magnet' => false]);
        }

        $product = Product::create($validated);

        // Attach courses if ecourse type
        if ($product->type === 'ecourse' && !empty($validated['course_ids'])) {
            Course::whereIn('id', $validated['course_ids'])->update(['product_id' => $product->id]);
        }

        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        $product->load('courses');
        
        $availableCourses = Course::whereNull('product_id')
            ->orWhere('product_id', $product->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/products-form', [
            'product' => $product,
            'courses' => $availableCourses,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'affiliate_commission_rate' => 'nullable|numeric|min:0|max:100',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'type' => 'required|in:ecourse,ebook,template,affiliate_link',
            'file' => 'nullable|file|max:51200',
            'external_url' => 'nullable|url',
            'order' => 'nullable|integer',
            'status' => 'required|in:active,inactive',
            'is_default' => 'nullable|boolean',
            'is_lead_magnet' => 'nullable|boolean',
            'course_ids' => 'nullable|array',
            'course_ids.*' => 'exists:courses,id',
        ]);

        // Generate new slug if title changed
        if ($validated['title'] !== $product->title) {
            $validated['slug'] = Str::slug($validated['title']);
            
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Product::where('slug', $validated['slug'])->where('id', '!=', $product->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            if ($product->thumbnail) {
                Storage::disk('public')->delete($product->thumbnail);
            }
            $validated['thumbnail'] = $request->file('thumbnail')->store('products/thumbnails', 'public');
        }

        // Handle file upload
        if ($request->hasFile('file')) {
            if ($product->file_path) {
                Storage::disk('public')->delete($product->file_path);
            }
            $validated['file_path'] = $request->file('file')->store('products/files', 'public');
        }

        // Handle is_default constraint - only one product can be default
        if (!empty($validated['is_default']) && $validated['is_default']) {
            Product::where('is_default', true)->where('id', '!=', $product->id)->update(['is_default' => false]);
        }

        // Handle is_lead_magnet constraint - only one product can be lead magnet
        if (!empty($validated['is_lead_magnet']) && $validated['is_lead_magnet']) {
            Product::where('is_lead_magnet', true)->where('id', '!=', $product->id)->update(['is_lead_magnet' => false]);
        }

        $product->update($validated);

        // Update course associations
        if ($product->type === 'ecourse') {
            // Remove old associations
            Course::where('product_id', $product->id)->update(['product_id' => null]);
            
            // Add new associations
            if (!empty($validated['course_ids'])) {
                Course::whereIn('id', $validated['course_ids'])->update(['product_id' => $product->id]);
            }
        }

        return redirect()->route('admin.products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        // Delete files
        if ($product->thumbnail) {
            Storage::disk('public')->delete($product->thumbnail);
        }
        if ($product->file_path) {
            Storage::disk('public')->delete($product->file_path);
        }

        // Remove course associations
        Course::where('product_id', $product->id)->update(['product_id' => null]);

        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
