<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Load settings from database into config
        try {
            $settings = \App\Models\Setting::getAllCached();
            
            // Map settings to config values
            if (isset($settings['course_price'])) {
                config(['app.course_price' => $settings['course_price']]);
            }
            
            if (isset($settings['affiliate_commission_percent'])) {
                config(['affiliate.default_commission_percent' => $settings['affiliate_commission_percent']]);
            }
            
            if (isset($settings['affiliate_minimum_payout'])) {
                config(['affiliate.minimum_payout' => $settings['affiliate_minimum_payout']]);
            }
            
            if (isset($settings['affiliate_milestones_json'])) {
                $milestones = json_decode($settings['affiliate_milestones_json'], true);
                if ($milestones) {
                    config(['affiliate.milestones.weekly' => $milestones]);
                }
            }
        } catch (\Exception $e) {
            // Silently fail during migrations or when settings table doesn't exist
        }
    }
}
