<?php

namespace App\Services;

use App\Models\Affiliate;
use App\Models\AffiliateClick;
use App\Models\AffiliateConversion;
use App\Models\AffiliateLedger;
use App\Models\AffiliatePayout;
use App\Models\AffiliateCampaign;
use App\Models\Order;
use App\Models\User;
use App\Models\UserAnalytic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AffiliateService
{
    /**
     * Capture affiliate click and set cookie
     */
    public function captureClick(string $affKey, Request $request): ?AffiliateClick
    {
        $affiliate = Affiliate::where('aff_key', $affKey)->where('status', 'active')->first();

        if (!$affiliate) {
            return null;
        }

        // Get or generate cookie ID
        $cookieId = $request->cookie(config('affiliate.cookie_name')) ?? Str::uuid()->toString();

        // Get active campaign if exists
        $campaign = AffiliateCampaign::where('active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->first();

        // Extract UTM parameters
        $utm = [
            'source' => $request->query('utm_source'),
            'medium' => $request->query('utm_medium'),
            'campaign' => $request->query('utm_campaign'),
            'content' => $request->query('utm_content'),
            'term' => $request->query('utm_term'),
        ];

        // Create click record
        $click = AffiliateClick::create([
            'affiliate_id' => $affiliate->id,
            'campaign_id' => $campaign?->id,
            'cookie_id' => $cookieId,
            'ip_hash' => hash('sha256', $request->ip()),
            'user_agent' => $request->userAgent(),
            'referer' => $request->header('referer'),
            'path' => $request->path(),
            'utm' => array_filter($utm), // Remove null values
            'converted' => false,
        ]);

        // Track via analytics
        UserAnalytic::create([
            'session_id' => session()->getId(),
            'event_type' => 'engagement',
            'event_data' => [
                'action' => 'affiliate_click',
                'affiliate_id' => $affiliate->id,
                'aff_key' => $affKey,
                'click_id' => $click->id,
            ],
            'referral_source' => $request->header('referer'),
            'utm_source' => $utm['source'],
            'utm_medium' => $utm['medium'],
            'utm_campaign' => $utm['campaign'],
            'utm_content' => $utm['content'],
            'utm_term' => $utm['term'],
            'ip_hash' => hash('sha256', $request->ip()),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        // Set signed cookie
        Cookie::queue(
            config('affiliate.cookie_name'),
            $cookieId,
            config('affiliate.cookie_lifetime'),
            '/',
            null,
            true,
            true,
            false,
            'strict'
        );

        return $click;
    }

    /**
     * Get last valid click for session within attribution window
     */
    public function getLastValidClickForSession(Request $request, int $windowDays = null): ?AffiliateClick
    {
        $windowDays = $windowDays ?? config('affiliate.attribution_window_days', 30);
        $cookieId = $request->cookie(config('affiliate.cookie_name'));

        if (!$cookieId) {
            return null;
        }

        $cutoffDate = Carbon::now()->subDays($windowDays);

        return AffiliateClick::where('cookie_id', $cookieId)
            ->where('created_at', '>=', $cutoffDate)
            ->where('converted', false)
            ->orderBy('created_at', 'desc')
            ->first();
    }

    /**
     * Award conversion commission to affiliate
     */
    public function awardConversion(
        Order $order,
        User $buyerUser,
        float $orderAmount,
        array $metadata = [],
        ?int $productId = null
    ): ?AffiliateConversion {
        // Check if conversion already exists (idempotency)
        $existingConversion = AffiliateConversion::where('order_id', $order->order_id)->first();
        if ($existingConversion) {
            Log::info('Conversion already exists for order', ['order_id' => $order->order_id]);
            return $existingConversion;
        }

        // Determine if this is an upsell (user has previous conversions)
        $previousConversion = AffiliateConversion::where('user_id', $buyerUser->id)
            ->orderBy('created_at', 'asc')
            ->first();

        $affiliate = null;
        $click = null;
        $isUpsell = false;

        if ($previousConversion) {
            // This is an upsell - reward the original affiliate
            $affiliate = $previousConversion->affiliate;
            $click = $previousConversion->click; // Keep reference to original click
            $isUpsell = true;

            Log::info('Upsell detected - awarding to original affiliate', [
                'user_id' => $buyerUser->id,
                'affiliate_id' => $affiliate->id,
                'original_conversion_id' => $previousConversion->id,
            ]);
        } else {
            // First conversion - use click-based tracking
            $click_id_from_meta = $order->meta['affiliate_click_id'] ?? null;

            if ($click_id_from_meta) {

                $click = AffiliateClick::find($click_id_from_meta);

                Log::info('First conversion detected - using click_id from order meta', [
                    'user_id' => $buyerUser->id,
                    'affiliate_id' => $click ? $click->affiliate_id : null,
                    'click_id' => $click_id_from_meta,
                    'order_id' => $order->order_id,
                ]);
            } else {
                // 2. FALLBACK: Cek cookie (untuk alur pembelian produk non-registrasi)
                // Logika ini akan gagal di webhook, tapi akan berhasil di alur pembelian produk lain
                $click = $this->getLastValidClickForSession(request());

                Log::info('First conversion detected - using click-based tracking (cookie)', [
                    'user_id' => $buyerUser->id,
                    'affiliate_id' => $click ? $click->affiliate_id : null,
                    'click_id' => $click ? $click->id : null,
                    'order_id' => $order->order_id,
                ]);
            }

            if (!$click) {
                Log::info('No valid affiliate click found for order', ['order_id' => $order->order_id]);
                return null; // Error Anda sebelumnya terjadi di sini
            }

            $affiliate = $click->affiliate;
        }

        // Prevent self-referral
        if ($affiliate->user_id && $affiliate->user_id === $buyerUser->id) {
            Log::info('Self-referral blocked', [
                'affiliate_id' => $affiliate->id,
                'user_id' => $buyerUser->id,
            ]);
            return null;
        }

        DB::beginTransaction();
        try {
            // Get commission rate - prioritize: product rate > campaign rate > default rate
            $campaign = $click->campaign;
            $commissionPercent = \App\Models\Setting::get('affiliate_commission_percent', 10);

            // Calculate commission based on product, campaign, or default rate
            $productCommissionRate = null;
            if ($productId) {
                $product = \App\Models\Product::find($productId);
                if ($product && $product->affiliate_commission_rate !== null) {
                    $commissionPercent = $product->affiliate_commission_rate;
                } elseif ($campaign && $campaign->isActive()) {
                    $commissionPercent = $campaign->getCommissionPercent();
                }
            } elseif ($campaign && $campaign->isActive()) {
                $commissionPercent = $campaign->getCommissionPercent();
            }

            $commissionAmount = ($orderAmount * $commissionPercent) / 100;

            // Create conversion record
            $conversion = AffiliateConversion::create([
                'affiliate_id' => $affiliate->id,
                'order_id' => $order->order_id,
                'campaign_id' => $click->campaign?->id,
                'user_id' => $buyerUser->id,
                'product_id' => $productId,
                'click_id' => $click->id,
                'order_amount' => $orderAmount,
                'commission_amount' => $commissionAmount,
                'status' => 'pending',
                'meta' => array_merge($metadata, [
                    'commission_percent' => $commissionPercent,
                    'campaign_name' => $campaign?->name,
                ]),
            ]);

            // Update affiliate pending balance
            $affiliate->increment('pending_balance', $commissionAmount);
            $affiliate->refresh();

            // Create ledger entry
            AffiliateLedger::create([
                'affiliate_id' => $affiliate->id,
                'type' => 'credit',
                'amount' => $commissionAmount,
                'balance_after' => $affiliate->pending_balance,
                'reference_type' => 'conversion',
                'reference_id' => $conversion->id,
                'note' => "Commission from order {$order->order_id} (pending approval)",
            ]);

            // Mark click as converted
            $click->markConverted();

            // Track conversion via analytics
            UserAnalytic::create([
                'session_id' => session()->getId(),
                'event_type' => 'conversion',
                'event_data' => [
                    'action' => 'affiliate_conversion',
                    'affiliate_id' => $affiliate->id,
                    'conversion_id' => $conversion->id,
                    'order_id' => $order->order_id,
                    'commission_amount' => $commissionAmount,
                ],
                'user_id' => $buyerUser->id,
                'ip_hash' => hash('sha256', request()->ip()),
                'user_agent' => request()->userAgent(),
                'created_at' => now(),
            ]);

            // Check and award milestone bonuses
            $this->checkAndAwardMilestones($affiliate);

            DB::commit();

            Log::info('Affiliate conversion awarded', [
                'conversion_id' => $conversion->id,
                'affiliate_id' => $affiliate->id,
                'order_id' => $order->order_id,
                'commission' => $commissionAmount,
            ]);

            return $conversion;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to award affiliate conversion', [
                'error' => $e->getMessage(),
                'order_id' => $order->order_id,
            ]);
            throw $e;
        }
    }

    /**
     * Approve commission and move from pending to available balance
     */
    public function approveCommission(int $conversionId): bool
    {
        $conversion = AffiliateConversion::find($conversionId);

        if (!$conversion || $conversion->status !== 'pending') {
            return false;
        }

        DB::beginTransaction();
        try {
            $affiliate = $conversion->affiliate;
            $commissionAmount = $conversion->commission_amount;

            // Move from pending to available balance
            $affiliate->decrement('pending_balance', $commissionAmount);
            $affiliate->increment('balance', $commissionAmount);
            $affiliate->refresh();

            // Update conversion status
            $conversion->update(['status' => 'approved']);

            // Create ledger entry
            AffiliateLedger::create([
                'affiliate_id' => $affiliate->id,
                'type' => 'credit',
                'amount' => $commissionAmount,
                'balance_after' => $affiliate->balance,
                'reference_type' => 'conversion_approved',
                'reference_id' => $conversion->id,
                'note' => "Commission approved for order {$conversion->order_id}",
            ]);

            DB::commit();

            Log::info('Commission approved', [
                'conversion_id' => $conversionId,
                'affiliate_id' => $affiliate->id,
                'amount' => $commissionAmount,
            ]);

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to approve commission', [
                'error' => $e->getMessage(),
                'conversion_id' => $conversionId,
            ]);
            return false;
        }
    }

    /**
     * Request payout
     */
    public function requestPayout(int $affiliateId, float $amount, array $payoutMethod): ?AffiliatePayout
    {
        $affiliate = Affiliate::find($affiliateId);

        if (!$affiliate) {
            throw new \Exception('Affiliate not found');
        }

        // Validate minimum payout
        $minPayout = \App\Models\Setting::get('affiliate_minimum_payout', 100000);
        if ($amount < $minPayout) {
            throw new \Exception("Minimum payout is {$minPayout}");
        }

        // Validate available balance
        if ($amount > $affiliate->balance) {
            throw new \Exception('Insufficient balance');
        }

        DB::beginTransaction();
        try {
            // Create payout request
            $payout = AffiliatePayout::create([
                'affiliate_id' => $affiliateId,
                'amount' => $amount,
                'status' => 'requested',
                'payout_method' => $payoutMethod,
            ]);

            // Deduct from available balance
            $affiliate->decrement('balance', $amount);
            $affiliate->refresh();

            // Create ledger entry
            AffiliateLedger::create([
                'affiliate_id' => $affiliateId,
                'type' => 'debit',
                'amount' => $amount,
                'balance_after' => $affiliate->balance,
                'reference_type' => 'payout_request',
                'reference_id' => $payout->id,
                'note' => "Payout request #{$payout->id}",
            ]);

            DB::commit();

            Log::info('Payout requested', [
                'payout_id' => $payout->id,
                'affiliate_id' => $affiliateId,
                'amount' => $amount,
            ]);

            return $payout;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to request payout', [
                'error' => $e->getMessage(),
                'affiliate_id' => $affiliateId,
            ]);
            throw $e;
        }
    }

    /**
     * Check and award milestone bonuses
     */
    protected function checkAndAwardMilestones(Affiliate $affiliate): void
    {
        // Fetch milestones from database settings
        $milestonesJson = \App\Models\Setting::get('affiliate_milestones_json');
        if (!$milestonesJson) {
            return;
        }

        $milestones = json_decode($milestonesJson, true);
        if (!is_array($milestones)) {
            return;
        }

        foreach ($milestones as $milestone) {
            $period = $milestone['period'] ?? 'weekly';
            $target = $milestone['target'] ?? 0;
            $bonusPercent = $milestone['bonus_percent'] ?? 0;

            // Determine date range based on period
            switch ($period) {
                case 'daily':
                    $periodStart = Carbon::now()->startOfDay();
                    $periodKey = $periodStart->format('Y-m-d');
                    $periodLabel = 'day';
                    break;
                case 'monthly':
                    $periodStart = Carbon::now()->startOfMonth();
                    $periodKey = $periodStart->format('Y-m');
                    $periodLabel = 'month';
                    break;
                case 'weekly':
                default:
                    $periodStart = Carbon::now()->startOfWeek();
                    $periodKey = $periodStart->format('Y-W');
                    $periodLabel = 'week';
                    break;
            }

            // Count conversions in the period
            $periodConversions = $affiliate->conversions()
                ->where('status', 'approved')
                ->where('created_at', '>=', $periodStart)
                ->count();

            if ($periodConversions >= $target) {
                // Check if bonus already awarded for this period
                $existingBonus = AffiliateConversion::where('affiliate_id', $affiliate->id)
                    ->where('status', 'approved')
                    ->where('meta->milestone_period', $periodKey)
                    ->where('meta->milestone_target', $target)
                    ->exists();

                if (!$existingBonus) {
                    $bonusAmount = ($affiliate->conversions()
                        ->where('status', 'approved')
                        ->where('created_at', '>=', $periodStart)
                        ->sum('commission_amount') * $bonusPercent) / 100;

                    // Create bonus conversion
                    $bonusConversion = AffiliateConversion::create([
                        'affiliate_id' => $affiliate->id,
                        'order_id' => 'MILESTONE_' . Str::random(10),
                        'order_amount' => 0,
                        'commission_amount' => $bonusAmount,
                        'status' => 'approved',
                        'meta' => [
                            'type' => 'milestone_bonus',
                            'milestone_target' => $target,
                            'milestone_period' => $periodKey,
                            'milestone_type' => $period,
                            'bonus_percent' => $bonusPercent,
                        ],
                    ]);

                    // Add to available balance directly
                    $affiliate->increment('balance', $bonusAmount);
                    $affiliate->refresh();

                    AffiliateLedger::create([
                        'affiliate_id' => $affiliate->id,
                        'type' => 'credit',
                        'amount' => $bonusAmount,
                        'balance_after' => $affiliate->balance,
                        'reference_type' => 'milestone_bonus',
                        'reference_id' => $bonusConversion->id,
                        'note' => "Milestone bonus: {$target} conversions in a {$periodLabel}",
                    ]);

                    Log::info('Milestone bonus awarded', [
                        'affiliate_id' => $affiliate->id,
                        'period' => $period,
                        'target' => $target,
                        'bonus' => $bonusAmount,
                    ]);
                }
            }
        }
    }
}
