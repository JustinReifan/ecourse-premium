<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'order_id' => 'ORDER_' . strtoupper($this->faker->unique()->bothify('???###')),
            'user_id' => User::factory(),
            'amount' => $this->faker->randomFloat(2, 100000, 5000000),
            'status' => 'completed',
            'payment_method' => $this->faker->randomElement(['credit_card', 'bank_transfer', 'ewallet']),
            'meta' => null,
        ];
    }
}
