<?php

namespace App\Http\Controllers;

use App\Models\VehiculeLocalisation;
use Illuminate\Http\Request;

class VehiculeLocalisationController extends Controller
{
    public function index(Request $request)
    {
        $query = VehiculeLocalisation::with('dossier:id,reference,importateur,dra');

        // Filtrer par position
        if ($request->filled('position')) {
            $query->where('position', $request->input('position'));
        }

        // Filtrer par statut
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filtrer par plaque
        if ($request->filled('plaque')) {
            $query->where('plaque', 'like', '%' . $request->input('plaque') . '%');
        }

        return response()->json($query->orderBy('last_seen_at', 'desc')->get());
    }

    public function show($id)
    {
        $vehicule = VehiculeLocalisation::with('dossier')->findOrFail($id);
        return response()->json($vehicule);
    }

    public function updatePosition(Request $request, $id)
    {
        $request->validate([
            'position' => 'required|string|max:100',
            'status' => 'nullable|string|max:50',
        ]);

        $vehicule = VehiculeLocalisation::findOrFail($id);
        $vehicule->position = $request->input('position');
        $vehicule->last_seen_at = now();
        if ($request->filled('status')) {
            $vehicule->status = $request->input('status');
        }
        $vehicule->save();

        return response()->json($vehicule);
    }

    public function stats()
    {
        $total = VehiculeLocalisation::count();
        $parPosition = VehiculeLocalisation::selectRaw('position, count(*) as total')
            ->groupBy('position')
            ->pluck('total', 'position');
        $parStatus = VehiculeLocalisation::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');
        $apurés = VehiculeLocalisation::whereHas('dossier', function ($q) {
            $q->where('status', 'apure');
        })->count();

        return response()->json([
            'total' => $total,
            'par_position' => $parPosition,
            'par_status' => $parStatus,
            'apures' => $apurés,
        ]);
    }
}
