<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Affiliate;
use App\Models\PayoutMethod;
use Illuminate\Http\Request;
use App\Models\AffiliateClick;
use App\Models\AffiliateLedger;
use App\Services\AffiliateService;
use App\Models\AffiliateConversion;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AffiliateController extends Controller
{
    protected AffiliateService $affiliateService;

    public function __construct(AffiliateService $affiliateService)
    {
        $this->affiliateService = $affiliateService;
    }

    /**
     * Show affiliate dashboard
     */
    public function dashboard(Request $request)
    {
        $user = Auth::user();
        $affiliate = $user->affiliate;

        if (!$affiliate) {
            return Inertia::render('affiliate/register');
        }

        // Get date range for filtering
        $startDate = $request->query('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->query('end_date', Carbon::now()->format('Y-m-d'));

        // Stats
        $stats = [
            'total_clicks' => $affiliate->clicks()->count(),
            'total_conversions' => $affiliate->conversions()->where('status', 'approved')->count(),
            'pending_conversions' => $affiliate->conversions()->where('status', 'pending')->count(),
            'conversion_rate' => $affiliate->conversion_rate,
            'pending_balance' => $affiliate->pending_balance,
            'available_balance' => $affiliate->balance,
            'total_earnings' => $affiliate->conversions()
                ->whereIn('status', ['approved', 'paid'])
                ->sum('commission_amount'),
        ];

        // Recent conversions (downline activity)
        $recentConversions = $affiliate->conversions()
            ->with(['user', 'order', 'product'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        // Ledger history
        $ledger = $affiliate->ledger()
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        // Payout history
        $payouts = $affiliate->payouts()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Share link
        $shareLink = $affiliate->getShareLink();

        // Get active campaigns
        $activeCampaigns = \App\Models\AffiliateCampaign::where('active', true)
            ->where(function ($query) {
                $query->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', Carbon::now());
            })
            ->where(function ($query) {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', Carbon::now());
            })
            ->get();

        // minimum payouts
        $minimumPayouts = Setting::get('affiliate_minimum_payout', 100000);

        return Inertia::render('affiliate/dashboard', [
            'affiliate' => $affiliate,
            'stats' => $stats,
            'conversions' => $recentConversions,
            'ledger' => $ledger,
            'payouts' => $payouts,
            'shareLink' => $shareLink,
            'activeCampaigns' => $activeCampaigns,
            'minimumPayouts' => $minimumPayouts,
        ]);
    }

    /**
     * Register as affiliate
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'upline_aff_key' => 'nullable|string|exists:affiliates,aff_key',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user = Auth::user();

        // Check if already registered
        if ($user->affiliate) {
            return redirect()->route('affiliate.dashboard');
        }

        $uplineAffiliate = null;
        if ($request->upline_aff_key) {
            $uplineAffiliate = Affiliate::where('aff_key', $request->upline_aff_key)->first();
        }

        $affiliate = Affiliate::create([
            'user_id' => $user->id,
            'name' => $request->name ?? $user->name,
            'email' => $request->email ?? $user->email,
            'upline_affiliate_id' => $uplineAffiliate?->id,
            'status' => 'active',
            'balance' => 0,
            'pending_balance' => 0,
        ]);

        return redirect()->route('affiliate.dashboard')
            ->with('success', 'Successfully registered as affiliate!');
    }

    /**
     * Track conversion from client-side (POST from frontend after payment success)
     * Non-blocking, idempotent endpoint
     */
    public function trackConversion(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'nullable|string',
            'cookie_affiliate' => 'nullable|string',
            'utm' => 'nullable|array',
        ]);




        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'awarded' => false,
                'reason' => 'validation_failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $orderId = $request->order_id;
            $amount = $request->amount;
            $cookieAffiliate = $request->cookie_affiliate ?? $request->cookie(config('affiliate.cookie_name'));
            $buyerUserId = Auth::id();

            // Get last valid click within attribution window
            $click = null;
            if ($cookieAffiliate) {
                $windowDays = config('affiliate.attribution_window_days', 30);
                $cutoffDate = Carbon::now()->subDays($windowDays);

                $click = AffiliateClick::where('cookie_id', $cookieAffiliate)
                    ->where('created_at', '>=', $cutoffDate)
                    ->where('converted', false)
                    ->orderBy('created_at', 'desc')
                    ->first();
            }

            if (!$click) {
                Log::debug('No valid affiliate click found', ['order_id' => $orderId, 'cookie' => $cookieAffiliate]);
                return response()->json([
                    'success' => true,
                    'awarded' => false,
                    'reason' => 'no_click',
                ]);
            }

            // Check for duplicate conversion
            $existingConversion = AffiliateConversion::where('order_id', $orderId)->first();
            if ($existingConversion) {
                Log::debug('Conversion already exists', ['order_id' => $orderId]);
                return response()->json([
                    'success' => true,
                    'awarded' => false,
                    'reason' => 'duplicate',
                ]);
            }

            $affiliate = $click->affiliate;

            // Prevent self-referral
            if ($affiliate->user_id && $affiliate->user_id === $buyerUserId) {
                Log::info('Self-referral blocked', [
                    'affiliate_id' => $affiliate->id,
                    'user_id' => $buyerUserId,
                    'order_id' => $orderId,
                ]);
                return response()->json([
                    'success' => true,
                    'awarded' => false,
                    'reason' => 'self_referral',
                ]);
            }

            // Create a temporary order record for the service
            // The service only needs the order_id property
            $order = new Order();
            $order->order_id = $orderId;

            // Create buyer user object
            $buyerUser = Auth::user();
            if (!$buyerUser) {
                // For guest purchases, create a temporary user object
                $buyerUser = new \stdClass();
                $buyerUser->id = null;
            }

            // Award conversion using existing service
            $conversion = $this->affiliateService->awardConversion(
                $order,
                $buyerUser,
                $amount,
                [
                    'payment_method' => $request->payment_method,
                    'utm' => $request->utm,
                    'client_tracked' => true,
                ]
            );

            if ($conversion) {
                Log::info('Affiliate conversion tracked', [
                    'order_id' => $orderId,
                    'affiliate_id' => $affiliate->id,
                    'commission' => $conversion->commission_amount,
                ]);

                return response()->json([
                    'success' => true,
                    'awarded' => true,
                    'commission' => $conversion->commission_amount,
                ]);
            }

            // Log::debug('Affiliate track payload', [
            //     'cookieAffiliate' => $cookieAffiliate,
            //     'buyerUserId' => $buyerUserId,
            //     'orderId' => $orderId,
            //     'click' => $click ? $click->id : null,
            // ]);

            return response()->json([
                'success' => true,
                'awarded' => false,
                'reason' => 'service_declined',
            ]);
        } catch (\Exception $e) {
            Log::error('Affiliate conversion tracking failed', [
                'error' => $e->getMessage(),
                'order_id' => $request->order_id,
                'trace' => $e->getTraceAsString(),
            ]);

            // Return success to not block client flow
            return response()->json([
                'success' => true,
                'awarded' => false,
                'reason' => 'error',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal error',
            ], 200); // Return 200 to not break client flow
        }
    }

    /**
     * Request payout
     */
    public function requestPayout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:' . config('affiliate.minimum_payout', 100000),
            'payout_method_id' => 'required|exists:payout_methods,id',
            'account_name' => 'required|string',
            'account_number' => 'required|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $user = Auth::user();
        $affiliate = $user->affiliate;

        if (!$affiliate) {
            return back()->withErrors(['error' => 'You are not registered as an affiliate']);
        }

        $payoutMethod = PayoutMethod::find($request->payout_method_id);

        try {
            $payout = $this->affiliateService->requestPayout(
                $affiliate->id,
                $request->amount,
                [
                    'method_id' => $payoutMethod->id,
                    'method_name' => $payoutMethod->name,
                    'method_type' => $payoutMethod->type,
                    'account_name' => $request->account_name,
                    'account_number' => $request->account_number,
                ]
            );

            return back()->with('success', 'Payout request submitted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Get ledger entries
     */
    public function ledger(Request $request)
    {
        $user = Auth::user();
        $affiliate = $user->affiliate;

        if (!$affiliate) {
            return response()->json(['error' => 'Not an affiliate'], 403);
        }

        $ledger = $affiliate->ledger()
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($ledger);
    }

    /**
     * Public leaderboard
     */
    public function leaderboard()
    {
        $topByConversions = Affiliate::where('status', 'active')
            ->withCount(['conversions' => function ($q) {
                $q->where('status', 'approved');
            }])
            ->orderBy('conversions_count', 'desc')
            ->limit(10)
            ->get();

        $topByRate = Affiliate::where('status', 'active')
            ->withCount(['clicks', 'conversions' => function ($q) {
                $q->where('status', 'approved');
            }])
            ->having('clicks_count', '>', 10) // Minimum clicks for fair comparison
            ->get()
            ->map(function ($affiliate) {
                $affiliate->conversion_rate = $affiliate->clicks_count > 0
                    ? ($affiliate->conversions_count / $affiliate->clicks_count) * 100
                    : 0;
                return $affiliate;
            })
            ->sortByDesc('conversion_rate')
            ->take(10)
            ->values();

        return Inertia::render('affiliate/leaderboard', [
            'topByConversions' => $topByConversions,
            'topByRate' => $topByRate,
        ]);
    }
}
