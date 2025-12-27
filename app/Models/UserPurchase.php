<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * UserPurchase Model
 * 
 * @property int $id
 * @property int $user_id
 * @property int $product_id
 * @property int|null $order_id
 * @property float $amount_paid
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class UserPurchase extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'order_id',
        'amount_paid',
        'access_ends_at',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'access_ends_at' => 'datetime',
    ];

    /**
     * Check if subscription is active (null = lifetime, future date = active)
     */
    public function isActive(): bool
    {
        return $this->access_ends_at === null || $this->access_ends_at->isFuture();
    }

    /**
     * Check if subscription has expired
     */
    public function isExpired(): bool
    {
        return $this->access_ends_at !== null && $this->access_ends_at->isPast();
    }

    /**
     * Check if subscription is lifetime
     */
    public function isLifetime(): bool
    {
        return $this->access_ends_at === null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
