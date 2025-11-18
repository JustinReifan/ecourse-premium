<?php

namespace App\Http\Controllers;

use Exception;
use Inertia\Inertia;
use App\Models\Module;
use Illuminate\Http\Request;
use App\Models\ModuleMaterial;

class ModuleMaterialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $materials = ModuleMaterial::with('module')
            ->orderBy('created_at', 'desc')
            ->get();

        $modules = Module::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('admin/module-material', [
            'materials' => $materials,
            'modules' => $modules,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    // public function create()
    // {
    //     return redirect()->route('admin.modules.index');
    // }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'text' => 'nullable|string',
            'module_id' => 'required|exists:modules,id',
        ]);

        ModuleMaterial::create($validated);

        return redirect()->route('admin.module-materials.index')
            ->with('success', 'Materials created successfully.');
    }

    /**
     * Display the specified resource.
     */
    // public function show(Module $module)
    // {
    //     return redirect()->route('admin.modules.index');
    // }

    /**
     * Show the form for editing the specified resource.
     */
    // public function edit(Module $module)
    // {
    //     return redirect()->route('admin.modules.index');
    // }

    /**
     * Update the specified resource in storage.
     */
    public function update(ModuleMaterial $module_material, Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'module_id' => 'required|exists:modules,id',
            'url' => 'nullable|string|max:255',
            'text' => 'nullable|string',
        ]);


        try {
            $module_material->update($validated);
        } catch (Exception $e) {
            return redirect()->route('admin.module-materials.index')
                ->with('error', 'Module update failed.');
        }

        return redirect()->route('admin.module-materials.index')
            ->with('success', 'Module updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ModuleMaterial $material)
    {
        $material->delete();

        return redirect()->route('admin.module-materials.index')
            ->with('success', 'Module deleted successfully.');
    }
}
