<?php

namespace App\Http\Controllers;

use App\Models\PayoutMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayoutMethodController extends Controller
{
    /**
     * Display a listing of payout methods
     */
    public function index()
    {
        $payoutMethods = PayoutMethod::orderBy('created_at', 'desc')->get();

        return Inertia::render('admin/payout-methods', [
            'payoutMethods' => $payoutMethods,
        ]);
    }

    /**
     * Store a newly created payout method
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:bank,ewallet',
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        PayoutMethod::create($validated);

        return back()->with('success', 'Payout method created successfully');
    }

    /**
     * Update the specified payout method
     */
    public function update(Request $request, PayoutMethod $payoutMethod)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:bank,ewallet',
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $payoutMethod->update($validated);

        return back()->with('success', 'Payout method updated successfully');
    }

    /**
     * Remove the specified payout method
     */
    public function destroy(PayoutMethod $payoutMethod)
    {
        $payoutMethod->delete();

        return back()->with('success', 'Payout method deleted successfully');
    }

    /**
     * Get active payout methods for public use
     */
    public function active()
    {
        return response()->json([
            'payoutMethods' => PayoutMethod::active()->get(),
        ]);
    }
}
