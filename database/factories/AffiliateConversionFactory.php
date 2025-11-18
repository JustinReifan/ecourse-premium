<?php

namespace Database\Factories;

use App\Models\AffiliateConversion;
use App\Models\Affiliate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AffiliateConversionFactory extends Factory
{
    protected $model = AffiliateConversion::class;

    public function definition(): array
    {
        $orderAmount = $this->faker->randomFloat(2, 100000, 5000000);
        $commissionPercent = 10;
        $commissionAmount = ($orderAmount * $commissionPercent) / 100;

        return [
            'affiliate_id' => Affiliate::factory(),
            'campaign_id' => null,
            'order_id' => 'ORDER_' . strtoupper($this->faker->unique()->bothify('???###')),
            'user_id' => User::factory(),
            'click_id' => null,
            'order_amount' => $orderAmount,
            'commission_amount' => $commissionAmount,
            'status' => 'pending',
            'meta' => ['commission_percent' => $commissionPercent],
        ];
    }
}
