<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use App\Support\CustomerStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const ROLE_OWNER = 'Владелец';
    public const ROLE_SENIOR_ADMIN = 'Старший администратор';
    public const ROLE_ADMIN = 'Действующий админ';
    public const ROLE_WAREHOUSE_MANAGER = 'Заведующий складом';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'profile_phone',
        'profile_telegram',
        'profile_address',
        'password',
        'api_token',
        'is_admin',
        'admin_status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'api_token',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function favoriteTeas(): BelongsToMany
    {
        return $this->belongsToMany(Tea::class, 'favorite_tea_user')->withTimestamps();
    }

    public function purchasedQuantity(): int
    {
        return (int) $this->orders()
            ->where('status', '!=', Order::STATUS_REJECTED)
            ->sum('total_quantity');
    }

    public function customerStatus(): array
    {
        return CustomerStatus::fromQuantity($this->purchasedQuantity());
    }

    public function hasAdminAccess(): bool
    {
        return $this->is_admin || in_array($this->admin_status, [
            self::ROLE_OWNER,
            self::ROLE_SENIOR_ADMIN,
            self::ROLE_ADMIN,
        ], true);
    }

    public function canManageInventory(): bool
    {
        return $this->hasAdminAccess() || $this->admin_status === self::ROLE_WAREHOUSE_MANAGER;
    }

    public function canManageUsers(): bool
    {
        return in_array($this->admin_status, [
            self::ROLE_OWNER,
            self::ROLE_SENIOR_ADMIN,
        ], true);
    }
}
