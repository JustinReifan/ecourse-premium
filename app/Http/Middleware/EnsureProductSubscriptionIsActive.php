<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Course;
use App\Models\Module;
use App\Models\UserPurchase;

class EnsureProductSubscriptionIsActive
{
    /**
     * Handle an incoming request.
     * 
     * Protect course/module routes by checking if user has active subscription
     * for the associated product.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Resolve product from route parameters
        $productId = $this->resolveProductId($request);

        if (!$productId) {
            // No product found to validate - allow access
            return $next($request);
        }

        // Find user's purchase for this product
        $purchase = UserPurchase::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        // No purchase found
        if (!$purchase) {
            return $this->denyAccess($request, 'Kamu belum memiliki akses ke produk ini. Silakan beli terlebih dahulu.');
        }

        // Check if subscription is active
        if ($purchase->isExpired()) {
            return $this->denyAccess($request, 'Langganan kamu untuk kursus ini sudah habis. Silakan perpanjang untuk melanjutkan belajar.');
        }

        return $next($request);
    }

    /**
     * Resolve the product ID from route parameters (course or module)
     */
    protected function resolveProductId(Request $request): ?int
    {
        // Check for course route parameter
        $course = $request->route('course');
        if ($course) {
            if ($course instanceof Course) {
                return $course->product_id;
            }
            // If it's a slug, load the course
            $courseModel = Course::where('slug', $course)->first();
            return $courseModel?->product_id;
        }

        // Check for module route parameter
        $module = $request->route('module');
        if ($module) {
            if ($module instanceof Module) {
                return $module->course?->product_id;
            }
            // If it's a slug, load the module with course
            $moduleModel = Module::where('slug', $module)->with('course')->first();
            return $moduleModel?->course?->product_id;
        }

        return null;
    }

    /**
     * Deny access and redirect with error message
     */
    protected function denyAccess(Request $request, string $message): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $message,
                'subscription_expired' => true,
            ], 403);
        }

        return redirect()
            ->route('member.index')
            ->with('error', $message);
    }
}
