<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Order Model
 *
 * @property int $id
 * @property string $order_id
 * @property int $user_id
 * @property float $amount
 * @property string $status
 * @property string|null $payment_method
 * @property array|null $meta
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Order extends Model
{
    protected $fillable = [
        'order_id',
        'user_id',
        'amount',
        'status',
        'type',
        'payment_method',
        'meta',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'meta' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function affiliateConversions(): HasMany
    {
        return $this->hasMany(AffiliateConversion::class, 'order_id', 'order_id');
    }

    /**
     * Check if order is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
