<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Commission Rate
    |--------------------------------------------------------------------------
    |
    | Default commission percentage for affiliates (e.g., 10 = 10%)
    |
    */
    'default_commission_percent' => env('AFFILIATE_COMMISSION_PERCENT', 10),

    /*
    |--------------------------------------------------------------------------
    | Attribution Window (Days)
    |--------------------------------------------------------------------------
    |
    | Number of days an affiliate click is valid for attribution
    |
    */
    'attribution_window_days' => env('AFFILIATE_ATTRIBUTION_DAYS', 30),

    /*
    |--------------------------------------------------------------------------
    | Cookie Settings
    |--------------------------------------------------------------------------
    |
    | Cookie name and expiration for tracking affiliate clicks
    |
    */
    'cookie_name' => 'affiliate_click_id',
    'cookie_lifetime' => 60 * 24 * 30, // 30 days in minutes

    /*
    |--------------------------------------------------------------------------
    | Minimum Payout Amount
    |--------------------------------------------------------------------------
    |
    | Minimum balance required to request a payout
    |
    */
    'minimum_payout' => env('AFFILIATE_MIN_PAYOUT', 10000), // 100k IDR

    /*
    |--------------------------------------------------------------------------
    | Milestone Bonuses
    |--------------------------------------------------------------------------
    |
    | Weekly milestone targets and bonus amounts
    |
    */
    'milestones' => [
        'weekly' => [
            ['target' => 5, 'bonus_percent' => 5],
            ['target' => 10, 'bonus_percent' => 10],
            ['target' => 20, 'bonus_percent' => 15],
        ],
    ],
];