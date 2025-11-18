<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * PayoutMethod Model
 *
 * @property int $id
 * @property string $name
 * @property string $type
 * @property string|null $description
 * @property bool $active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class PayoutMethod extends Model
{
    protected $fillable = [
        'name',
        'type',
        'description',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Scope to get only active methods
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
