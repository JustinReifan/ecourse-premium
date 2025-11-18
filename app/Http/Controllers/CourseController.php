<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $courses = Course::withCount('modules')
            ->orderBy('order')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/courses', [
            'courses' => $courses
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return redirect()->route('admin.courses.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'thumbnail' => 'required|file|image|mimes:jpeg,png,webp|max:10480',
            'order' => 'nullable|integer|min:0',
            'status' => 'required|in:active,inactive'
        ]);

        $slug = str()->slug($request->name);
        $validated['slug'] = $slug;

        // Simpan video ke storage
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('courseThumbnail', 'public');
            $validated['thumbnail'] = $path;
        }

        Course::create($validated);

        return redirect()->route('admin.courses.index')
            ->with('success', 'Course created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        return redirect()->route('admin.courses.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Course $course)
    {
        return redirect()->route('admin.courses.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
            'status' => 'required|in:active,inactive'
        ]);

        $slug = str()->slug($request->name);
        $validated['slug'] = $slug;

        if ($request->hasFile('thumbnail')) {
            // Optional: hapus file lama jika ada
            if ($course->thumbnail && Storage::disk('public')->exists($course->thumbnail)) {
                Storage::disk('public')->delete($course->thumbnail);
            }

            $path = $request->file('thumbnail')->store('courseThumbnail', 'public');
            $validated['thumbnail'] = $path;
        } else {
            // Jika tidak ada file baru, pertahankan thumbnail lama
            $validated['thumbnail'] = $course->thumbnail;
        }

        $course->update($validated);

        return redirect()->route('admin.courses.index')
            ->with('success', 'Course updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {

        // delete thumbnail
        if ($course->thumbnail && Storage::disk('public')->exists($course->thumbnail)) {
            Storage::disk('public')->delete($course->thumbnail);
        }

        $course->delete();

        return redirect()->route('admin.courses.index')
            ->with('success', 'Course deleted successfully.');
    }
}
