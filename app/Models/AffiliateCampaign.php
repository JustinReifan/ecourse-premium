<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

/**
 * AffiliateCampaign Model
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string $commission_type
 * @property array|null $commission_value
 * @property \Carbon\Carbon|null $starts_at
 * @property \Carbon\Carbon|null $ends_at
 * @property bool $active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class AffiliateCampaign extends Model
{
    protected $fillable = [
        'name',
        'description',
        'commission_type',
        'commission_value',
        'starts_at',
        'ends_at',
        'active',
    ];

    protected $casts = [
        'commission_value' => 'array',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'active' => 'boolean',
    ];

    public function clicks(): HasMany
    {
        return $this->hasMany(AffiliateClick::class, 'campaign_id');
    }

    public function conversions(): HasMany
    {
        return $this->hasMany(AffiliateConversion::class, 'campaign_id');
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(AffiliateMilestone::class, 'campaign_id');
    }

    /**
     * Check if campaign is currently active
     */
    public function isActive(): bool
    {
        if (!$this->active) {
            return false;
        }

        $now = Carbon::now();

        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }

        if ($this->ends_at && $now->gt($this->ends_at)) {
            return false;
        }

        return true;
    }

    /**
     * Get commission percentage for this campaign
     */
    public function getCommissionPercent(): float
    {
        if ($this->commission_type === 'percent' && isset($this->commission_value['percent'])) {
            return (float) $this->commission_value['percent'];
        }

        return config('affiliate.default_commission_percent', 10);
    }
}
