<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Product Model
 * 
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property string|null $description
 * @property float $price
 * @property string|null $thumbnail
 * @property string $type (ecourse, ebook, template, affiliate_link)
 * @property string|null $file_path
 * @property string|null $external_url
 * @property int $order
 * @property string $status
 */
class Product extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'price',
        'affiliate_commission_rate',
        'thumbnail',
        'type',
        'file_path',
        'external_url',
        'order',
        'status',
        'is_default',
        'is_lead_magnet',
    ];

    /**
     * Get the lead magnet product
     */
    public static function getLeadMagnetProduct(): ?self
    {
        return static::where('is_lead_magnet', true)->first();
    }

    /**
     * Get the default product
     */
    public static function getDefaultProduct(): ?self
    {
        return static::where('is_default', true)->first();
    }

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(UserPurchase::class);
    }

    public function purchasers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_purchases')
            ->withTimestamps()
            ->withPivot('amount_paid', 'order_id');
    }

    /**
     * Check if product is an ecourse type
     */
    public function isEcourse(): bool
    {
        return $this->type === 'ecourse';
    }

    /**
     * Check if product is owned by user
     */
    public function isOwnedBy(int $userId): bool
    {
        return $this->purchases()->where('user_id', $userId)->exists();
    }
}
