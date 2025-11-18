<?php

namespace Database\Factories;

use App\Models\Affiliate;
use Illuminate\Database\Eloquent\Factories\Factory;

class AffiliateFactory extends Factory
{
    protected $model = Affiliate::class;

    public function definition(): array
    {
        return [
            'user_id' => null,
            'aff_key' => 'aff_' . strtoupper($this->faker->unique()->bothify('????####')),
            'name' => $this->faker->name(),
            'email' => $this->faker->email(),
            'upline_affiliate_id' => null,
            'status' => 'active',
            'meta' => null,
            'balance' => 0,
            'pending_balance' => 0,
        ];
    }
}
