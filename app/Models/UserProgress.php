<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProgress extends Model
{
    protected $table = 'user_progress';
    
    protected $fillable = [
        'user_id',
        'course_id',
        'module_id',
        'is_module_completed',
        'course_completion_percentage',
        'completed_at',
    ];

    protected $casts = [
        'is_module_completed' => 'boolean',
        'course_completion_percentage' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    /**
     * Get user progress for a specific module
     */
    public static function getUserModuleProgress(int $userId, int $moduleId): ?self
    {
        return self::where('user_id', $userId)
            ->where('module_id', $moduleId)
            ->first();
    }

    /**
     * Calculate and update course completion percentage for a user
     */
    public static function updateCourseProgress(int $userId, int $courseId): float
    {
        $course = Course::with(['modules' => function ($query) {
            $query->where('status', 'published');
        }])->find($courseId);

        if (!$course) {
            return 0;
        }

        $totalModules = $course->modules->count();
        if ($totalModules === 0) {
            return 0;
        }

        $completedModules = self::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('is_module_completed', true)
            ->count();

        $completionPercentage = round(($completedModules / $totalModules) * 100, 2);

        // Update all progress records for this user/course
        self::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->update(['course_completion_percentage' => $completionPercentage]);

        return $completionPercentage;
    }
}