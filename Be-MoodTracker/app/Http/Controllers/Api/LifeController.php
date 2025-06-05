<?php

namespace App\Http\Controllers\api;

use App\Models\Life;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class LifeController extends Controller
{
        /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Life::all());
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
                'category' => 'required|in:Pribadi,Kerja,Belajar',
                'status' => 'required|in:Completed,Pending',
                'date' => 'required|date|after_or_equal:today',
            ], [
                // Custom messages
                'title.required' => 'Judul harus diisi, jangan kosong!',
                'title.min' => 'Judul minimal harus 3 karakter',
                'category.required' => 'Kategori wajib diisi. Pilihan yang valid: Pribadi, Kerja, Belajar.',
                'category.in' => 'Kategori tidak valid. Pilihan yang tersedia hanya: Pribadi, Kerja, Belajar.',
                'status.required' => 'Status wajib diisi. Jangan lupa pilih Completed atau Pending.',
                'status.in' => 'Status tidak valid. Gunakan Completed atau Pending saja.',
                'date.required' => 'Tanggal harus diisi. Jangan sampai kosong ya!',
                'date.after_or_equal' => 'Tanggal harus hari ini atau lebih baru.',
            ]);
        
            $life = Life::create($validated);
        
            return response()->json([
                'message' => 'Data Life berhasil dibuat',
                'data' => $life,
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
        $life = Life::findOrFail($id);

        if (!$life) {
            return response()->json([
                'message' => 'Data Life tidak ditemukan',
            ], 404);
        }

        // Untuk update data
        $request->merge([
            'category' => ucfirst(strtolower($request->category)),
        ]);

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255|min:3',
                'category' => 'required|in:Pribadi,Kerja,Belajar',
                'status' => 'required|in:Completed,Pending',
                'date' => 'required|date|after_or_equal:today',
            ], [
                // Custom messages
                'title.required' => 'Judul harus diisi, jangan kosong!',
                'title.min' => 'Judul minimal harus 3 karakter ya.',
                'category.required' => 'Kategori wajib diisi. Pilihan yang valid: Pribadi, Kerja, Belajar.',
                'category.in' => 'Kategori tidak valid. Pilihan yang tersedia hanya: Pribadi, Kerja, Belajar.',
                'status.required' => 'Status wajib diisi. Jangan lupa pilih Completed atau Pending.',
                'status.in' => 'Status tidak valid. Gunakan Completed atau Pending saja.',
                'date.required' => 'Tanggal harus diisi. Jangan sampai kosong ya!',
                'date.after_or_equal' => 'Tanggal harus hari ini atau lebih baru.',
            ]);
        
            $life->update($validated);
        
            return response()->json([
                'message' => 'Data Life berhasil diperbarui',
                'data' => $life,
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal. Pastikan semua field terisi dengan benar.',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Update the status of the specified Life.
     */
    public function updateStatus(Request $request, string $id)
    {
        try {

            $life = Life::findOrFail($id);
            
            $validated = $request->validate([
                'status' => 'required|in:Completed,Pending',
            ]);
            
            $life->update([
                'status' => $validated['status'],
            ]);

            return response()->json([
                'message' => 'Status data life berhasil diperbarui',
                'data' => $life,
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
        $life = Life::findOrFail($id);
        $life->delete();
        
        return response()->json([
            'message' => 'Data Life berhasil dihapus',
            'deleted' => $life
        ], 200);
    }
}
