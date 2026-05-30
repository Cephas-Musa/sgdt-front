<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // max 10MB
        ]);

        $file = $request->file('file');
        
        // Stocker le fichier dans storage/app/public/attachments
        $path = $file->store('attachments', 'public');
        
        return response()->json([
            'url' => Storage::url($path),
            'path' => $path,
            'name' => $file->getClientOriginalName()
        ]);
    }
}
