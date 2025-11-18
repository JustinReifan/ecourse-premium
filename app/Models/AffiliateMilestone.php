<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * AffiliateMilestone Model
 *
 * @property int $id
 * @property int|null $campaign_id
 * @property int $target_conversions
 * @property float|null $bonus_amount
 * @property float|null $bonus_percent
 * @property string $period
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class AffiliateMilestone extends Model
{
    protected $fillable = [
        'campaign_id',
        'target_conversions',
        'bonus_amount',
        'bonus_percent',
        'period',
    ];

    protected $casts = [
        'bonus_amount' => 'decimal:2',
        'bonus_percent' => 'decimal:2',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(AffiliateCampaign::class, 'campaign_id');
    }
}
