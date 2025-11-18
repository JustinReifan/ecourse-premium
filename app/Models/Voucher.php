<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = [
        'name',
        'code',
        'type',
        'value',
        'max_discount_amount',
        'usage_limit',
        'used_count',
        'expires_at',
        'status'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'value' => 'decimal:2',
        'max_discount_amount' => 'decimal:2'
    ];

    public function isValid(): bool
    {
        return $this->status === 'active' 
            && $this->used_count < $this->usage_limit
            && (!$this->expires_at || $this->expires_at->isFuture());
    }

    public function calculateDiscount(float $amount): float
    {
        if (!$this->isValid()) {
            return 0;
        }

        $discount = 0;
        
        if ($this->type === 'percentage') {
            $discount = ($amount * $this->value) / 100;
            if ($this->max_discount_amount && $discount > $this->max_discount_amount) {
                $discount = $this->max_discount_amount;
            }
        } else {
            $discount = min($this->value, $amount);
        }

        return $discount;
    }
}
