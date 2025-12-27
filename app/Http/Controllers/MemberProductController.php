<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\UserPurchase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemberProductController extends Controller
{
    /**
     * Show member's product library/catalog
     */
    public function index(Request $request)
    {
        $userId = auth()->id();

        // Get user's owned products with subscription data
        $ownedProducts = Product::whereHas('purchases', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->where('status', 'active')
            ->with(['courses' => function ($query) {
                $query->where('status', 'active')->with('modules');
            }])
            ->orderBy('order', 'asc')
            ->get()
            ->map(function ($product) use ($userId) {
                // Get user's purchase for subscription data
                $purchase = UserPurchase::where('user_id', $userId)
                    ->where('product_id', $product->id)
                    ->first();
                
                // Add subscription status
                $product->subscription_status = 'active';
                $product->access_ends_at = null;
                $product->is_lifetime = true;
                $product->is_expired = false;
                
                if ($purchase) {
                    $product->access_ends_at = $purchase->access_ends_at?->toISOString();
                    $product->is_lifetime = $purchase->isLifetime();
                    $product->is_expired = $purchase->isExpired();
                    
                    if ($purchase->isExpired()) {
                        $product->subscription_status = 'expired';
                    } elseif ($purchase->isLifetime()) {
                        $product->subscription_status = 'lifetime';
                    } else {
                        $product->subscription_status = 'active';
                    }
                }

                // Add user completion data for ecourses
                if ($product->type === 'ecourse') {
                    $product->courses->each(function ($course) use ($userId) {
                        $userProgress = \App\Models\UserProgress::where('user_id', $userId)
                            ->where('course_id', $course->id)
                            ->first();
                        $course->completion_percentage = $userProgress ? $userProgress->course_completion_percentage : 0;
                    });
                }
                return $product;
            });

        // Get products user hasn't purchased (for catalog)
        $availableProducts = Product::whereDoesntHave('purchases', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->where('status', 'active')
            ->orderBy('order', 'asc')
            ->get();

        // Filter by selected product if provided
        $selectedProductId = $request->query('product_id');
        $selectedProduct = null;

        if ($selectedProductId) {
            $selectedProduct = Product::with(['courses' => function ($query) {
                $query->where('status', 'active');
            }])
                ->find($selectedProductId);
        }

        return Inertia::render('member/index', [
            'ownedProducts' => $ownedProducts,
            'availableProducts' => $availableProducts,
            'selectedProduct' => $selectedProduct,
        ]);
    }

    /**
     * Show specific product courses (for owned ecourses)
     */
    public function showProduct(Product $product)
    {
        $userId = auth()->id();

        // Check if user owns this product
        if (!$product->isOwnedBy($userId)) {
            abort(403, 'You do not own this product.');
        }

        // Load product with courses
        $product->load(['courses' => function ($query) use ($userId) {
            $query->where('status', 'active')
                ->withCount('modules as module_count')
                ->orderBy('order', 'asc')
                ->orderBy('name', 'asc');
        }]);

        // Add completion data
        $product->courses->transform(function ($course) use ($userId) {
            $userProgress = \App\Models\UserProgress::where('user_id', $userId)
                ->where('course_id', $course->id)
                ->first();

            $course->completion_percentage = $userProgress ? $userProgress->course_completion_percentage : 0;
            return $course;
        });

        return Inertia::render('member/product-detail', [
            'product' => $product,
        ]);
    }
}
