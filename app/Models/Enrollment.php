<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    use HasFactory;
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'module_id',
        'start_date',
        'completion_date',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'completion_date' => 'datetime',
        ];
    }

    /**
     * Get the student (user) associated with the enrollment.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user associated with the enrollment (alias for student).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the module associated with the enrollment.
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    /**
     * Mark enrollment as completed with a status.
     */
    public function markCompleted(string $status = 'PASS'): bool
    {
        return $this->update([
            'completion_date' => now(),
            'status' => $status,
        ]);
    }

    /**
     * Check if enrollment is currently active.
     */
    public function isActive(): bool
    {
        return $this->status === 'IN_PROGRESS';
    }

    /**
     * Check if enrollment is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status !== 'IN_PROGRESS';
    }
}
