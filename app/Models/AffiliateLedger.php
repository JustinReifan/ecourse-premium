<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * AffiliateLedger Model
 *
 * @property int $id
 * @property int $affiliate_id
 * @property string $type
 * @property float $amount
 * @property float $balance_after
 * @property string|null $reference_type
 * @property string|null $reference_id
 * @property string|null $note
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class AffiliateLedger extends Model
{
    protected $table = 'affiliate_ledger';

    protected $fillable = [
        'affiliate_id',
        'type',
        'amount',
        'balance_after',
        'reference_type',
        'reference_id',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
    ];

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    /**
     * Check if this is a credit entry
     */
    public function isCredit(): bool
    {
        return $this->type === 'credit';
    }

    /**
     * Check if this is a debit entry
     */
    public function isDebit(): bool
    {
        return $this->type === 'debit';
    }
}
