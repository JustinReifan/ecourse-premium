<?php

namespace Database\Factories;

use App\Models\AffiliateClick;
use App\Models\Affiliate;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AffiliateClickFactory extends Factory
{
    protected $model = AffiliateClick::class;

    public function definition(): array
    {
        return [
            'affiliate_id' => Affiliate::factory(),
            'campaign_id' => null,
            'cookie_id' => Str::uuid()->toString(),
            'ip_hash' => hash('sha256', $this->faker->ipv4()),
            'user_agent' => $this->faker->userAgent(),
            'referer' => $this->faker->url(),
            'path' => '/',
            'utm' => null,
            'converted' => false,
        ];
    }
}
