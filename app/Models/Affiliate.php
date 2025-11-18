<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * Affiliate Model
 *
 * @property int $id
 * @property int|null $user_id
 * @property string $aff_key
 * @property string|null $name
 * @property string|null $email
 * @property int|null $upline_affiliate_id
 * @property string $status
 * @property array|null $meta
 * @property float $balance
 * @property float $pending_balance
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Affiliate extends Model
{
    protected $fillable = [
        'user_id',
        'aff_key',
        'name',
        'email',
        'upline_affiliate_id',
        'status',
        'meta',
        'balance',
        'pending_balance',
    ];

    protected $casts = [
        'meta' => 'array',
        'balance' => 'decimal:2',
        'pending_balance' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($affiliate) {
            if (empty($affiliate->aff_key)) {
                $affiliate->aff_key = 'aff_' . strtoupper(Str::random(8));
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function upline(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class, 'upline_affiliate_id');
    }

    public function downlines(): HasMany
    {
        return $this->hasMany(Affiliate::class, 'upline_affiliate_id');
    }

    public function clicks(): HasMany
    {
        return $this->hasMany(AffiliateClick::class);
    }

    public function conversions(): HasMany
    {
        return $this->hasMany(AffiliateConversion::class);
    }

    public function ledger(): HasMany
    {
        return $this->hasMany(AffiliateLedger::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(AffiliatePayout::class);
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(AffiliateReferral::class);
    }

    /**
     * Get total clicks count
     */
    public function getTotalClicksAttribute(): int
    {
        return $this->clicks()->count();
    }

    /**
     * Get approved conversions count
     */
    public function getTotalConversionsAttribute(): int
    {
        return $this->conversions()->where('status', 'approved')->count();
    }

    /**
     * Get conversion rate percentage
     */
    public function getConversionRateAttribute(): float
    {
        $clicks = $this->total_clicks;
        if ($clicks === 0) {
            return 0;
        }
        return ($this->total_conversions / $clicks) * 100;
    }

    /**
     * Check if affiliate is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get shareable link
     */
    public function getShareLink(): string
    {
        return url('/?aff=' . $this->aff_key);
    }
}
