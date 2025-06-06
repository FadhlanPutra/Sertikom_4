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

        try {
            $validated = $request->validate([
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

        $mood = mood::create($validated);

        return response()->json([
            'message' => 'Data Mood berhasil dibuat',
            'data' => $mood,
        ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal Pastikan semua field terisi dengan benar.',
                'errors' => $e->errors(),
            ], 422);
        }
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
                'message' => 'Data Mood tidak ditemukan',
            ], 404);
        }

        // Untuk update data
        $request->merge([
            'category' => ucfirst(strtolower($request->category)),
        ]);

        try {

            $validated = $request->validate([
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
        
            $mood->update($validated);
        
            return response()->json([
                'message' => 'Data Mood berhasil diperbarui',
                'data' => $mood,
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal Pastikan semua field terisi dengan benar.',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Update the status of the specified mood.
     */
    public function updateStatus(Request $request, string $id)
    {
        try {

            $mood = mood::findOrFail($id);
            
            $validated = $request->validate([
                'status' => 'required|in:Completed,Pending',
            ]);
            
            $mood->update([
                'status' => $validated['status'],
            ]);

            return response()->json([
                'message' => 'Status data mood berhasil diperbarui',
                'data' => $mood,
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal. Pastikan status hanya berisi \'Completed\' atau \'Pending\'.',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $mood = mood::findOrFail($id);
        $mood->delete();
        
        return response()->json([
            'message' => 'Data Mood berhasil dihapus',
            'deleted' => $mood
        ], 200);
    }
}
