<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\AbTestingService;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;

class LabsController extends Controller
{
    protected AbTestingService $abTestingService;

    public function __construct(AbTestingService $abTestingService)
    {
        $this->abTestingService = $abTestingService;
    }

    /**
     * A/B Testing Dashboard - Main endpoint
     */
    public function index(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'range' => 'nullable|in:3,5,7,14,30,custom',
        ]);

        // Determine date range
        $range = $request->get('range', '7');

        if ($range === 'custom') {
            $startDate = Carbon::parse($request->get('start_date', now()->subDays(7)));
            $endDate = Carbon::parse($request->get('end_date', now()))->endOfDay();
        } else {
            $days = (int) $range;
            $startDate = Carbon::now()->subDays($days)->startOfDay();
            $endDate = Carbon::now()->endOfDay();
        }

        // Generate cache key based on date range
        $cacheKey = "ab_testing_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}";
        $cacheDuration = 15 * 60; // 15 minutes in seconds

        // Fetch data with caching
        $data = Cache::remember($cacheKey, $cacheDuration, function () use ($startDate, $endDate) {
            return [
                'matrix' => $this->abTestingService->getPerformanceMatrix($startDate, $endDate),
                'funnel' => $this->abTestingService->getSplitFunnel($startDate, $endDate),
                'quality' => $this->abTestingService->getQualityAnalysis($startDate, $endDate),
            ];
        });

        // Return JSON for API calls
        if ($request->wantsJson()) {
            return response()->json([
                'matrix' => $data['matrix'],
                'funnel' => $data['funnel'],
                'quality' => $data['quality'],
                'meta' => [
                    'start_date' => $startDate->toIso8601String(),
                    'end_date' => $endDate->toIso8601String(),
                    'range' => $range,
                    'cached_at' => now()->toIso8601String(),
                ],
            ]);
        }

        // Return Inertia view for web interface
        return Inertia::render('admin/labs/index', [
            'matrix' => $data['matrix'],
            'funnel' => $data['funnel'],
            'quality' => $data['quality'],
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'range' => $range,
            ],
        ]);
    }

    /**
     * Clear cache for A/B testing data
     */
    public function clearCache(Request $request)
    {
        $range = $request->get('range', '7');
        $days = (int) $range;

        $startDate = Carbon::now()->subDays($days)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        $cacheKey = "ab_testing_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}";

        Cache::forget($cacheKey);

        return response()->json(
            [
                'success' => 'true',
                'message' => 'Cache cleared successfully'
            ]
        );
    }
}
