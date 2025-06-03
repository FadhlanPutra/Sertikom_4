<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\mood;
use Illuminate\Http\Request;

class MoodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(mood::all());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $request->merge([
            'category' => ucfirst(strtolower($request->category)),
        ]);

        $request->validate([
            'title' => 'required|string|max:255|min:3',
            'category' => 'required|in:Senang,Sedih,Stress',
            'status' => 'required|required|in:Completed,Pending',
            'date' => 'required|date|after_or_equal:yesterday',
        ], [
            // Custom messages
            'title.required' => 'Judul harus diisi, jangan lupa kasih nama mood kamu!',
            'title.min' => 'Judul minimal harus 3 karakter',
            'category.required' => 'Kategori wajib diisi. Pilihan yang valid: Senang, Sedih, Stress.',
            'category.in' => 'Kategori tidak valid. Pilihan yang tersedia hanya: Senang, Sedih, Stress.',
            'status.required' => 'Status wajib diisi. Jangan lupa pilih Completed atau Pending.',
            'status.in' => 'Status tidak valid. Gunakan Completed atau Pending saja.',
            'date.required' => 'Tanggal harus diisi. Jangan sampai kosong ya!',
            'date.after_or_equal' => 'Tanggal harus hari ini atau lebih baru.',
        ]);


        $mood = mood::create($request->all());

        return response()->json([
            'message' => 'mood created successfully',
            'data' => $mood,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $mood = mood::findOrFail($id);

        if (!$mood) {
            return response()->json([
                'message' => 'mood not found',
            ], 404);
        }

        // Untuk update data
        $request->merge([
            'category' => ucfirst(strtolower($request->category)),
        ]);

        $request->validate([
            'title' => 'required|string|max:255|min:3',
            'category' => 'required|in:Senang,Sedih,Stress',
            'status' => 'required|in:Completed,Pending',
            'date' => 'required|date|after_or_equal:today',
        ], [
            // Custom messages
            'title.required' => 'Judul harus diisi, jangan lupa kasih nama mood kamu!',
            'title.min' => 'Judul minimal harus 3 karakter ya.',
            'category.required' => 'Kategori wajib diisi. Pilihan yang valid: Senang, Sedih, Stress.',
            'category.in' => 'Kategori tidak valid. Pilihan yang tersedia hanya: Senang, Sedih, Stress.',
            'status.required' => 'Status wajib diisi. Jangan lupa pilih Completed atau Pending.',
            'status.in' => 'Status tidak valid. Gunakan Completed atau Pending saja.',
            'date.required' => 'Tanggal harus diisi. Jangan sampai kosong ya!',
            'date.after_or_equal' => 'Tanggal harus hari ini atau lebih baru.',
        ]);

        $mood->update($request->all());

        return response()->json([
            'message' => 'mood updated successfully',
            'data' => $mood,
        ], 200);
    }

    /**
     * Update the status of the specified mood.
     */
    public function updateStatus(Request $request, string $id)
    {
        $mood = mood::findOrFail($id);

        if (!$mood) {
            return response()->json([
                'message' => 'Data not found',
            ], 404);
        }

        $request->validate([
            'status' => 'required|in:Completed,Pending',
        ]);

        $mood->status = $request->status;
        $mood->save();

        return response()->json([
            'message' => 'mood status updated successfully',
            'data' => $mood,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $mood = mood::findOrFail($id);
        $mood->delete();
        
        return response()->json([
            'message' => 'mood deleted successfully',
            'deleted' => $mood
        ], 200);
    }
}
