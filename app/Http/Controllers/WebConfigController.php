<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WebConfigController extends Controller
{
    /**
     * Display the web configuration page
     */
    public function index(): Response
    {
        $settings = Setting::getAllCached();

        // Parse JSON fields
        if (isset($settings['affiliate_milestones_json'])) {
            $settings['affiliate_milestones'] = json_decode($settings['affiliate_milestones_json'], true) ?? [];
        } else {
            $settings['affiliate_milestones'] = [
                ['period' => 'weekly', 'target' => 5, 'bonus_percent' => 5],
                ['period' => 'weekly', 'target' => 10, 'bonus_percent' => 10],
                ['period' => 'weekly', 'target' => 20, 'bonus_percent' => 15],
            ];
        }

        return Inertia::render('admin/config/index', [
            'settings' => $settings
        ]);
    }

    /**
     * Update web configuration settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'landing_headline' => 'nullable|string|max:500',
            'landing_subheadline' => 'nullable|string|max:1000',
            'landing_vsl_url' => 'nullable|url|max:1000',
            'landing_badge' => 'nullable|string|max:255',
            'vsl_thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'course_price' => 'required|numeric|min:0',
            'owner_whatsapp' => 'nullable|string|max:20',
            'duitku_api_key' => 'nullable|string|max:500',
            'duitku_merchant_code' => 'nullable|string|max:255',
            'duitku_script_url' => 'nullable|url|max:500',
            'duitku_sandbox_mode' => 'nullable|boolean',
            'midtrans_api_key' => 'nullable|string|max:500',
            'midtrans_client_key' => 'nullable|string|max:500',
            'midtrans_merchant_id' => 'nullable|string|max:255',
            'midtrans_base_url' => 'nullable|url|max:500',
            'whatsapp_base_url' => 'nullable|url|max:500',
            'whatsapp_api_key' => 'nullable|string|max:500',
            'affiliate_commission_percent' => 'required|numeric|min:0|max:100',
            'affiliate_minimum_payout' => 'required|numeric|min:0',
            'affiliate_milestones' => 'nullable|array',
            'affiliate_milestones.*.period' => 'required|string',
            'affiliate_milestones.*.target' => 'required|integer|min:1',
            'affiliate_milestones.*.bonus_percent' => 'required|numeric|min:0|max:100',
        ]);

        // Handle file upload for VSL thumbnail
        if ($request->hasFile('vsl_thumbnail')) {
            $file = $request->file('vsl_thumbnail');
            $path = $file->store('settings', 'public');
            $validated['landing_vsl_thumbnail'] = asset('storage/' . $path);
            unset($validated['vsl_thumbnail']);
        }

        // Handle milestones as JSON
        if (isset($validated['affiliate_milestones'])) {
            $validated['affiliate_milestones_json'] = json_encode($validated['affiliate_milestones']);
            unset($validated['affiliate_milestones']);
        }

        // Save all settings
        foreach ($validated as $key => $value) {
            Setting::set($key, $value ?? '');
        }

        return redirect()->back()->with('success', 'Configuration updated successfully');
    }
}
