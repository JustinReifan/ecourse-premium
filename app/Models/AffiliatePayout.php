<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * AffiliatePayout Model
 *
 * @property int $id
 * @property int $affiliate_id
 * @property float $amount
 * @property string $status
 * @property array|null $payout_method
 * @property string|null $tx_reference
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class AffiliatePayout extends Model
{
    protected $fillable = [
        'affiliate_id',
        'amount',
        'status',
        'payout_method',
        'tx_reference',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payout_method' => 'array',
    ];

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    /**
     * Check if payout is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'requested';
    }

    /**
     * Check if payout is paid
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    /**
     * Mark payout as paid
     */
    public function markAsPaid(string $txReference): void
    {
        $this->update([
            'status' => 'paid',
            'tx_reference' => $txReference,
        ]);
    }

    /**
     * Reject payout
     */
    public function reject(): void
    {
        $this->update(['status' => 'rejected']);
    }
}
