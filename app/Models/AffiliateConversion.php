<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * AffiliateConversion Model
 *
 * @property int $id
 * @property int|null $affiliate_id
 * @property int|null $campaign_id
 * @property string $order_id
 * @property int|null $user_id
 * @property int|null $click_id
 * @property float $order_amount
 * @property float $commission_amount
 * @property string $status
 * @property array|null $meta
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class AffiliateConversion extends Model
{
    protected $fillable = [
        'affiliate_id',
        'campaign_id',
        'order_id',
        'user_id',
        'product_id',
        'click_id',
        'order_amount',
        'commission_amount',
        'status',
        'meta',
    ];

    protected $casts = [
        'order_amount' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'meta' => 'array',
    ];

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(AffiliateCampaign::class, 'campaign_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function click(): BelongsTo
    {
        return $this->belongsTo(AffiliateClick::class, 'click_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Product::class);
    }

    /**
     * Check if conversion is pending approval
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if conversion is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }
}
