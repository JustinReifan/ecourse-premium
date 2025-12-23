<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\MemberProductController;
use App\Http\Controllers\WhatsappNotifController;
use App\Http\Controllers\ModuleMaterialController;
use App\Http\Controllers\ProductPurchaseController;
use App\Http\Controllers\Auth\RegisteredUserController;

Route::get('/', function () {
    $settings = \App\Models\Setting::getAllCached();

    return Inertia::render('welcome', [
        'landingHeadline' => $settings['landing_headline'] ?? 'Strategi Jadi Canva Creator Sukses: Dari Nol Sampai Cuan Pertama di Dunia Digital',
        'landingSubheadline' => $settings['landing_subheadline'] ?? 'Dibimbing Langsung Dari Nol Sampai Bisa Ngasilin Cuan dari Canva',
        'landingBadge' => $settings['landing_badge'] ?? 'Premium Canva Masterclass',
        'landingVslThumbnail' => $settings['landing_vsl_thumbnail'] ?? null,
        'landingVslUrl' => $settings['landing_vsl_url'] ?? null,
        'coursePrice' => $settings['course_price'] ?? 0,
    ]);
})->name('home');



Route::post('/register/get-snap-token', [RegisteredUserController::class, 'getSnapToken'])->name('register.get-snap-token');
Route::post('/register/create-payment', [RegisteredUserController::class, 'createPaymentRequest'])
    ->name('register.create-payment');

Route::post('/api/payments/confirm-registration', [ProductPurchaseController::class, 'confirmInstantPayment'])
    ->name('payments.confirm-registration');

// Product purchase routes (public, requires auth)
Route::middleware('auth')->group(function () {
    Route::post('/products/create-payment', [ProductPurchaseController::class, 'createProductPaymentRequest'])
        ->middleware('auth')
        ->name('products.create-payment');
    Route::post('/api/payments/confirm-instant', [ProductPurchaseController::class, 'confirmInstantPayment']);
    // Route::post('/api/products/{product}/purchase', [\App\Http\Controllers\ProductPurchaseController::class, 'purchase'])->name('products.purchase');
    Route::get('/api/products/{product}/download', [\App\Http\Controllers\ProductPurchaseController::class, 'download'])->name('products.download');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Member routes
    Route::prefix('member')->name('member.')->group(function () {
        Route::get('/', [MemberProductController::class, 'index'])->name('index');
        Route::get('/products', [MemberProductController::class, 'index'])->name('products');
        Route::get('/products/{product:slug}', [MemberProductController::class, 'showProduct'])->name('product.show');
        Route::get('course/{course:slug}', [MemberController::class, 'course'])->name('course');
        Route::get('module/{module:slug}', [MemberController::class, 'module'])->name('module');
        Route::post('module/complete/{module}', [MemberController::class, 'markComplete'])->name('module.complete');
    });

    // Admin routes
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        // Dashboard route
        Route::get('/', function () {
            $stats = [
                'total_users' => \App\Models\User::count(),
                'total_courses' => \App\Models\Course::count(),
                'total_modules' => \App\Models\Module::count(),
                'active_courses' => \App\Models\Course::where('status', 'active')->count(),
            ];

            return Inertia::render('admin/dashboard', [
                'stats' => $stats
            ]);
        })->name('dashboard');

        // Analytics routes
        Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics');
        Route::get('/analytics/export', [AnalyticsController::class, 'export'])->name('analytics.export');

        // Resource routes
        Route::resource('products', ProductController::class);
        Route::resource('courses', CourseController::class);
        Route::resource('modules', ModuleController::class);
        Route::resource('module-materials', ModuleMaterialController::class);
        
        // Users (export route before resource to avoid ID collision)
        Route::get('/users/export', [UserController::class, 'export'])->name('users.export');
        Route::resource('users', UserController::class);
        Route::resource('vouchers', \App\Http\Controllers\VoucherController::class);

        // Payout Methods
        Route::resource('payout-methods', \App\Http\Controllers\PayoutMethodController::class);

        // Web Configuration
        Route::get('/config', [\App\Http\Controllers\WebConfigController::class, 'index'])->name('config');
        Route::post('/config', [\App\Http\Controllers\WebConfigController::class, 'update'])->name('config.update');
    });
});

// Analytics tracking API
Route::post('/api/analytics/track', [AnalyticsController::class, 'track'])->name('analytics.track');

// Voucher validation API
Route::post('/api/vouchers/validate', [\App\Http\Controllers\VoucherController::class, 'validate'])->name('vouchers.validate');

// Payment callback (public, no auth required)
Route::post('/api/callback/payment', [\App\Http\Controllers\PaymentController::class, 'callback'])->name('payment.callback');

// Manual conversion trigger (for testing - should be protected in production)
Route::post('/api/affiliate/trigger-conversion', [\App\Http\Controllers\PaymentController::class, 'triggerConversion'])->name('affiliate.trigger-conversion')->middleware('auth');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/affiliate.php';
