<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * AffiliateClick Model
 *
 * @property int $id
 * @property int $affiliate_id
 * @property int|null $campaign_id
 * @property string $cookie_id
 * @property string|null $ip_hash
 * @property string|null $user_agent
 * @property string|null $referer
 * @property string|null $path
 * @property array|null $utm
 * @property bool $converted
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class AffiliateClick extends Model
{
    protected $fillable = [
        'affiliate_id',
        'campaign_id',
        'cookie_id',
        'ip_hash',
        'user_agent',
        'referer',
        'path',
        'utm',
        'converted',
    ];

    protected $casts = [
        'utm' => 'array',
        'converted' => 'boolean',
    ];

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(AffiliateCampaign::class, 'campaign_id');
    }

    /**
     * Mark this click as converted
     */
    public function markConverted(): void
    {
        $this->update(['converted' => true]);
    }
}
