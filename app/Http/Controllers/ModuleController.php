<?php

namespace App\Http\Controllers;

use getID3;
use DateInterval;
use Inertia\Inertia;
use App\Models\Course;
use App\Models\Module;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class ModuleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $modules = Module::with('course')
            ->orderBy('order')
            ->orderBy('created_at', 'desc')
            ->get();

        $courses = Course::orderBy('name')->get();

        

        return Inertia::render('admin/modules', [
            'modules' => $modules,
            'courses' => $courses
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return redirect()->route('admin.modules.index');
    }

    private function getYoutubeId($url)
    {
        preg_match('%(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/ ]{11})%i', $url, $match);
        return $match[1] ?? null;
    }

    private function getYoutubeDuration($videoId)
    {
        $apiKey = env('YOUTUBE_API_KEY');
        $apiUrl = "https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id={$videoId}&key={$apiKey}";

        try {
            $response = Http::get($apiUrl);

            if ($response->successful()) {
                $data = $response->json();

                if (!empty($data['items'])) {
                    // Format durasi dari YouTube adalah ISO 8601 (contoh: PT1H2M10S)
                    $isoDuration = $data['items'][0]['contentDetails']['duration'];

                    // Convert ke detik
                    $interval = new DateInterval($isoDuration);
                    $seconds = ($interval->d * 86400) + ($interval->h * 3600) + ($interval->i * 60) + $interval->s;

                    return $seconds;
                }
            }
        } catch (\Exception $e) {
            // Log error jika diperlukan
            return 0;
        }

        return 0;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video_path' => 'required|url',
            'order' => 'nullable|integer|min:0',
            'status' => 'required|in:draft,published',
            'course_id' => 'required|exists:courses,id'
        ]);

        $videoId = $this->getYoutubeId($request->video_path);


        if ($videoId) {
            $duration = $this->getYoutubeDuration($videoId);


            $validated['duration'] = $duration;
        } else {
            $validated['duration'] = 0;
        }

        $validated['slug'] = str()->slug($request->name);

        Module::create($validated);

        return redirect()->route('admin.modules.index')
            ->with('success', 'Module created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Module $module)
    {
        return redirect()->route('admin.modules.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Module $module)
    {
        return redirect()->route('admin.modules.index');
    }


    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video_path' => 'nullable|url',
            'order' => 'nullable|integer|min:0',
            'status' => 'required|in:draft,published',
            'course_id' => 'required|exists:courses,id'
        ]);

        $validated['slug'] = str()->slug($request->name);

        // Cek apakah user menginput video_path
        if ($request->filled('video_path')) {
            if ($request->video_path !== $module->video_path) {
                $videoId = $this->getYoutubeId($request->video_path);

                if ($videoId) {
                    $duration = $this->getYoutubeDuration($videoId);
                    $validated['duration'] = $duration;
                } else {
                    $validated['duration'] = 0;
                }
            }
        } else {
            unset($validated['video_path']);
        }

        $module->update($validated);

        return redirect()->route('admin.modules.index')
            ->with('success', 'Module updated successfully.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Module $module)
    {

        // delete video
        if ($module->video_path && Storage::disk('public')->exists($module->video_path)) {
            Storage::disk('public')->delete($module->video_path);
        }

        $module->delete();

        return redirect()->route('admin.modules.index')
            ->with('success', 'Module deleted successfully.');
    }
}
