<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use getID3;

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

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'video_path' => 'required|file|mimetypes:video/mp4|max:202400',
            'order' => 'nullable|integer|min:0',
            'status' => 'required|in:draft,published',
            'course_id' => 'required|exists:courses,id'
        ]);

        if ($request->hasFile('video_path')) {
            $file = $request->file('video_path');
            $path = $file->store('videos', 'public');
            $validated['video_path'] = $path;

            // Gunakan getID3
            $getID3 = new getID3;
            $fileInfo = $getID3->analyze($file->getPathname());

            // Ambil durasi dalam detik
            $duration = isset($fileInfo['playtime_seconds'])
                ? (int) ceil($fileInfo['playtime_seconds'])
                : 0;

            $validated['duration'] = $duration;
        }

        $slug = str()->slug($request->name);
        $validated['slug'] = $slug;

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
            'video_path' => 'nullable|file|mimetypes:video/avi,video/mp4,video/mpeg,video/quicktime|max:202400',
            'order' => 'nullable|integer|min:0',
            'status' => 'required|in:draft,published',
            'course_id' => 'required|exists:courses,id'
        ]);

        // Handle slug
        $slug = str()->slug($request->name);
        $validated['slug'] = $slug;

        // Jika user upload file baru
        if ($request->hasFile('video_path')) {
            // Hapus file lama jika ada
            if ($module->video_path && Storage::disk('public')->exists($module->video_path)) {
                Storage::disk('public')->delete($module->video_path);
            }

            // Upload file baru
            $file = $request->file('video_path');
            $path = $file->store('videos', 'public');
            $validated['video_path'] = $path;

            // Hitung durasi baru (pakai getID3)
            $getID3 = new getID3;
            $fileInfo = $getID3->analyze($file->getPathname());
            $duration = isset($fileInfo['playtime_seconds'])
                ? (int) ceil($fileInfo['playtime_seconds'])
                : 0;

            $validated['duration'] = $duration;
        } else {
            // Jika tidak upload file baru → pertahankan video_path & duration lama
            $validated['video_path'] = $module->video_path;
            $validated['duration'] = $module->duration;
        }

        // Update data module
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
