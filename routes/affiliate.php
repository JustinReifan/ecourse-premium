<?php

use App\Http\Controllers\AffiliateController;
use App\Http\Controllers\AffiliateAdminController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/affiliate/leaderboard', [AffiliateController::class, 'leaderboard'])->name('affiliate.leaderboard');

// Authenticated user routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/affiliate', [AffiliateController::class, 'dashboard'])->name('affiliate.dashboard');
    Route::post('/affiliate/register', [AffiliateController::class, 'register'])->name('affiliate.register');
    Route::post('/affiliate/payout', [AffiliateController::class, 'requestPayout'])->name('affiliate.payout');
    Route::get('/affiliate/ledger', [AffiliateController::class, 'ledger'])->name('affiliate.ledger');
});

// Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.affiliates.')->group(function () {
//     Route::get('/affiliates', [AffiliateAdminController::class, 'index'])->name('index');
//     Route::get('/affiliates/{id}', [AffiliateAdminController::class, 'show'])->name('show');

//     Route::get('/affiliates/conversions', [AffiliateAdminController::class, 'conversions'])->name('conversions');
//     Route::post('/affiliates/conversions/{id}/approve', [AffiliateAdminController::class, 'approveConversion'])->name('conversions.approve');
//     Route::post('/affiliates/conversions/{id}/reject', [AffiliateAdminController::class, 'rejectConversion'])->name('conversions.reject');
//     Route::get('/affiliates/conversions/export', [AffiliateAdminController::class, 'exportConversions'])->name('conversions.export');

//     Route::get('/affiliates/payouts', [AffiliateAdminController::class, 'payouts'])->name('payouts');
//     Route::post('/affiliates/payouts/{id}/process', [AffiliateAdminController::class, 'processPayout'])->name('payouts.process');
//     Route::post('/affiliates/payouts/{id}/reject', [AffiliateAdminController::class, 'rejectPayout'])->name('payouts.reject');

//     Route::get('/affiliates/campaigns', [AffiliateAdminController::class, 'campaigns'])->name('campaigns');
//     Route::post('/affiliates/campaigns', [AffiliateAdminController::class, 'storeCampaign'])->name('campaigns.store');
//     Route::put('/affiliates/campaigns/{id}', [AffiliateAdminController::class, 'updateCampaign'])->name('campaigns.update');
//     Route::delete('/affiliates/campaigns/{id}', [AffiliateAdminController::class, 'destroyCampaign'])->name('campaigns.destroy');
// });

// Public API for payout methods
Route::get('/api/payout-methods/active', [\App\Http\Controllers\PayoutMethodController::class, 'active']);

// Admin routes
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/affiliates', [AffiliateAdminController::class, 'index'])->name('affiliates.index');
    Route::get('/affiliates/{id}', [AffiliateAdminController::class, 'show'])->name('affiliates.show');

    Route::get('/affiliates/conversions/list', [AffiliateAdminController::class, 'conversions'])->name('affiliates.conversions');
    Route::post('/affiliates/conversions/{id}/approve', [AffiliateAdminController::class, 'approveConversion'])->name('affiliates.conversions.approve');
    Route::post('/affiliates/conversions/{id}/reject', [AffiliateAdminController::class, 'rejectConversion'])->name('affiliates.conversions.reject');
    Route::get('/affiliates/conversions/export', [AffiliateAdminController::class, 'exportConversions'])->name('affiliates.conversions.export');

    Route::get('/affiliates/payouts/list', [AffiliateAdminController::class, 'payouts'])->name('affiliates.payouts');
    Route::post('/affiliates/payouts/{id}/process', [AffiliateAdminController::class, 'processPayout'])->name('affiliates.payouts.process');
    Route::post('/affiliates/payouts/{id}/reject', [AffiliateAdminController::class, 'rejectPayout'])->name('affiliates.payouts.reject');

    Route::get('/affiliates/campaigns/list', [AffiliateAdminController::class, 'campaigns'])->name('affiliates.campaigns');
    Route::post('/affiliates/campaigns', [AffiliateAdminController::class, 'storeCampaign'])->name('affiliates.campaigns.store');
    Route::put('/affiliates/campaigns/{id}', [AffiliateAdminController::class, 'updateCampaign'])->name('affiliates.campaigns.update');
    Route::delete('/affiliates/campaigns/{id}', [AffiliateAdminController::class, 'destroyCampaign'])->name('affiliates.campaigns.destroy');
});