<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\AffiliateConversion;
use App\Models\AffiliatePayout;
use App\Models\AffiliateCampaign;
use App\Services\AffiliateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class AffiliateAdminController extends Controller
{
    protected AffiliateService $affiliateService;

    public function __construct(AffiliateService $affiliateService)
    {
        $this->affiliateService = $affiliateService;
    }

    /**
     * List all affiliates
     */
    public function index(Request $request)
    {
        $query = Affiliate::with(['user', 'upline'])
            ->withCount(['clicks', 'conversions']);

        // Filters
        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('aff_key', 'like', "%{$request->search}%");
            });
        }

        $affiliates = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('admin/affiliates/index', [
            'affiliates' => $affiliates,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Show affiliate details
     */
    public function show($id)
    {
        $affiliate = Affiliate::with([
            'user',
            'upline',
            'clicks' => fn($q) => $q->latest()->limit(50),
            'conversions' => fn($q) => $q->with(['user', 'order', 'product'])->latest()->limit(50),
            'ledger' => fn($q) => $q->latest()->limit(100),
            'payouts' => fn($q) => $q->latest(),
        ])->findOrFail($id);

        $stats = [
            'total_clicks' => $affiliate->clicks()->count(),
            'total_conversions' => $affiliate->conversions()->where('status', 'approved')->count(),
            'pending_conversions' => $affiliate->conversions()->where('status', 'pending')->count(),
            'total_earnings' => $affiliate->conversions()->whereIn('status', ['approved', 'paid'])->sum('commission_amount'),
            'total_paid_out' => $affiliate->payouts()->where('status', 'paid')->sum('amount'),
        ];

        return Inertia::render('admin/affiliates/show', [
            'affiliate' => $affiliate,
            'stats' => $stats,
        ]);
    }

    /**
     * List pending conversions
     */
    public function conversions(Request $request)
    {
        $query = AffiliateConversion::with(['affiliate', 'user', 'order', 'product']);


        // handle if status return all, show all data

        if ($request->status && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        $conversions = $query->orderBy('created_at', 'desc')->paginate(50);

        return Inertia::render('admin/affiliates/conversions', [
            'conversions' => $conversions,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Approve conversion
     */
    public function approveConversion($id)
    {
        $success = $this->affiliateService->approveCommission($id);

        if ($success) {
            return back()->with('success', 'Commission approved successfully');
        }

        return back()->withErrors(['error' => 'Failed to approve commission']);
    }

    /**
     * Reject conversion
     */
    public function rejectConversion($id)
    {
        $conversion = AffiliateConversion::findOrFail($id);

        if ($conversion->status !== 'pending') {
            return back()->withErrors(['error' => 'Can only reject pending conversions']);
        }

        DB::beginTransaction();
        try {
            $affiliate = $conversion->affiliate;

            // Return to affiliate pending balance
            $affiliate->decrement('pending_balance', $conversion->commission_amount);

            // Update conversion status
            $conversion->update(['status' => 'rejected']);

            DB::commit();

            return back()->with('success', 'Conversion rejected');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to reject conversion']);
        }
    }

    /**
     * List payout requests
     */
    public function payouts(Request $request)
    {
        $query = AffiliatePayout::with('affiliate');

        if ($request->status && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        $payouts = $query->orderBy('created_at', 'desc')->paginate(50);

        return Inertia::render('admin/affiliates/payouts', [
            'payouts' => $payouts,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Process payout
     */
    public function processPayout(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'tx_reference' => 'required|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $payout = AffiliatePayout::findOrFail($id);

        if (!$payout->isPending()) {
            return back()->withErrors(['error' => 'Payout already processed']);
        }

        $payout->markAsPaid($request->tx_reference);

        return back()->with('success', 'Payout marked as paid');
    }

    /**
     * Reject payout
     */
    public function rejectPayout($id)
    {
        $payout = AffiliatePayout::findOrFail($id);

        if (!$payout->isPending()) {
            return back()->withErrors(['error' => 'Payout already processed']);
        }

        DB::beginTransaction();
        try {
            $affiliate = $payout->affiliate;

            // Return amount to available balance
            $affiliate->increment('balance', $payout->amount);

            $payout->reject();

            DB::commit();

            return back()->with('success', 'Payout rejected, balance returned to affiliate');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to reject payout']);
        }
    }

    /**
     * Export conversions to CSV
     */
    public function exportConversions(Request $request)
    {
        $conversions = AffiliateConversion::with(['affiliate', 'user', 'order', 'product'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->get();

        $csv = "ID,Affiliate,Order ID,User,Product,Amount,Commission,Status,Date\n";

        foreach ($conversions as $conversion) {
            $csv .= sprintf(
                "%d,%s,%s,%s,%s,%.2f,%.2f,%s,%s\n",
                $conversion->id,
                $conversion->affiliate->name ?? $conversion->affiliate->aff_key,
                $conversion->order_id,
                $conversion->user->name ?? '-',
                $conversion->product ? $conversion->product->title : 'Initial Registration',
                $conversion->order_amount,
                $conversion->commission_amount,
                $conversion->status,
                $conversion->created_at->format('Y-m-d H:i:s')
            );
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="conversions-' . date('Y-m-d') . '.csv"');
    }

    /**
     * Campaign management
     */
    public function campaigns()
    {
        $campaigns = AffiliateCampaign::withCount(['clicks', 'conversions'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/affiliates/campaigns', [
            'campaigns' => $campaigns,
        ]);
    }

    /**
     * Create campaign
     */
    public function storeCampaign(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'commission_percent' => 'required|numeric|min:0|max:100',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        AffiliateCampaign::create([
            'name' => $request->name,
            'description' => $request->description,
            'commission_type' => 'percent',
            'commission_value' => ['percent' => $request->commission_percent],
            'starts_at' => $request->starts_at,
            'ends_at' => $request->ends_at,
            'active' => $request->active ?? true,
        ]);

        return back()->with('success', 'Campaign created successfully');
    }

    /**
     * Update campaign
     */
    public function updateCampaign(Request $request, $id)
    {
        $campaign = AffiliateCampaign::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'commission_percent' => 'required|numeric|min:0|max:100',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $campaign->update([
            'name' => $request->name,
            'description' => $request->description,
            'commission_value' => ['percent' => $request->commission_percent],
            'starts_at' => $request->starts_at,
            'ends_at' => $request->ends_at,
            'active' => $request->active ?? $campaign->active,
        ]);

        return back()->with('success', 'Campaign updated successfully');
    }

    /**
     * Delete campaign
     */
    public function destroyCampaign($id)
    {
        $campaign = AffiliateCampaign::findOrFail($id);
        $campaign->delete();

        return back()->with('success', 'Campaign deleted successfully');
    }
}
