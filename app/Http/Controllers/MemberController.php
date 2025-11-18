<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Module;
use App\Models\UserProgress;
use Inertia\Inertia;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $courses = Course::select([
            'id',
            'name',
            'slug',
            'description',
            'thumbnail',
            'order',
            'status'
        ])
            ->where('status', 'active')
            ->whereHas('modules', function ($query) {
                $query->where('status', 'published');
            })
            ->withCount('modules as module_count')
            ->orderBy('order', 'asc')
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($course) use ($userId) {
                // Get user's completion percentage for this course
                $userProgress = UserProgress::where('user_id', $userId)
                    ->where('course_id', $course->id)
                    ->first();

                $course->completion_percentage = $userProgress ? $userProgress->course_completion_percentage : 0;

                // Add placeholder thumbnails for courses without images
                if (!$course->thumbnail) {
                    $placeholders = [
                        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
                        'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&q=80',
                        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
                        'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&q=80'
                    ];
                    $course->thumbnail = $placeholders[array_rand($placeholders)];
                }

                return $course;
            });

        return Inertia::render('member/index', [
            'courses' => $courses
        ]);
    }

    public function course(Course $course)
    {
        $userId = auth()->id();

        // Load course with modules
        $course->load(['modules' => function ($query) {
            $query->where('status', 'published')
                ->orderBy('order', 'asc')
                ->orderBy('name', 'asc');
        }]);

        // Add placeholder thumbnail if none exists
        if (!$course->thumbnail) {
            $placeholders = [
                'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
                'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&q=80',
                'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
                'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&q=80'
            ];
            $course->thumbnail = $placeholders[array_rand($placeholders)];
        }

        // Get user's progress for each module and format duration
        $course->modules->transform(function ($module) use ($userId) {
            // Get user's progress for this module
            $userProgress = UserProgress::getUserModuleProgress($userId, $module->id);
            $module->is_completed = $userProgress ? $userProgress->is_module_completed : false;

            // Format duration
            $module->duration = $this->formatDuration($module->duration);
            return $module;
        });

        // Get user's course completion percentage
        $userProgress = UserProgress::where('user_id', $userId)
            ->where('course_id', $course->id)
            ->first();

        $course->completion_percentage = $userProgress ? $userProgress->course_completion_percentage : 0;

        return Inertia::render('member/course', [
            'course' => $course
        ]);
    }

    public function module(Module $module)
    {
        $userId = auth()->id();

        // Load the module with its course and all course modules
        $module->load([
            'course' => function ($query) {
                $query->select('id', 'name', 'slug', 'description', 'thumbnail');
            },
            'course.modules' => function ($query) {
                $query->where('status', 'published')
                    ->orderBy('order', 'asc')
                    ->orderBy('name', 'asc')
                    ->select('id', 'name', 'slug', 'course_id', 'order', 'video_path', 'duration', 'status');
            },
            'materials' => function ($query) {
                $query->select('id', 'name', 'module_id', 'url', 'text');
            }
        ]);

        // Get user's progress for current module
        $userProgress = UserProgress::getUserModuleProgress($userId, $module->id);
        $module->is_completed = $userProgress ? $userProgress->is_module_completed : false;
        $module->duration = $this->formatDuration($module->duration);

        // Get user's progress for all course modules
        $module->course->modules->transform(function ($siblingModule) use ($module, $userId) {
            $siblingUserProgress = UserProgress::getUserModuleProgress($userId, $siblingModule->id);
            $siblingModule->is_completed = $siblingUserProgress ? $siblingUserProgress->is_module_completed : false;
            $siblingModule->is_current = $siblingModule->id === $module->id;
            $siblingModule->duration = $this->formatDuration($siblingModule->duration);

            return $siblingModule;
        });

        // Get user's course completion percentage
        $courseProgress = UserProgress::where('user_id', $userId)
            ->where('course_id', $module->course->id)
            ->first();

        $module->course->completion_percentage = $courseProgress ? $courseProgress->course_completion_percentage : 0;

        // Find current module index and determine navigation
        $modulesList = $module->course->modules->toArray();
        $currentIndex = array_search($module->id, array_column($modulesList, 'id'));

        $prevModule = $currentIndex > 0 ? $modulesList[$currentIndex - 1] : null;
        $nextModule = $currentIndex < count($modulesList) - 1 ? $modulesList[$currentIndex + 1] : null;

        return Inertia::render('member/module', [
            'module' => $module,
            'prevModule' => $prevModule,
            'nextModule' => $nextModule
        ]);
    }

    public function markComplete(Request $request, Module $module)
    {
        try {
            $userId = auth()->id();
            $courseId = $module->course_id;

            // Create or update user progress for this module
            UserProgress::updateOrCreate(
                [
                    'user_id' => $userId,
                    'module_id' => $module->id,
                ],
                [
                    'course_id' => $courseId,
                    'is_module_completed' => true,
                    'completed_at' => now(),
                ]
            );

            // Calculate and update course completion percentage
            $completionPercentage = UserProgress::updateCourseProgress($userId, $courseId);

            return response()->json([
                'success' => true,
                'completion_percentage' => $completionPercentage,
                'message' => 'Module has been completed.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function formatDuration($seconds)
    {
        if (!$seconds) return '0 sec';
        $minutes = floor($seconds / 60);
        $remainingSeconds = $seconds % 60;
        return ($minutes > 0 ? "{$minutes} min " : '') . "{$remainingSeconds} sec";
    }
}
