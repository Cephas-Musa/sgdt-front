<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Dossier;
use App\Models\EmptyManifest;
use App\Models\Mouvement;

class RechercheController extends Controller
{
    public function search(Request $request)
    {
        $dossiers = Dossier::query();
        $manifests = EmptyManifest::query();
        $mouvements = Mouvement::query();

        if ($request->filled('reference_dossier')) {
            $dossiers->where('reference', 'like', '%' . $request->reference_dossier . '%');
        }
        if ($request->filled('dra')) {
            $dossiers->where('dra', 'like', '%' . $request->dra . '%');
        }
        if ($request->filled('t1')) {
            $dossiers->where('t1', 'like', '%' . $request->t1 . '%');
        }
        if ($request->filled('plaque')) {
            $dossiers->where('plaque', 'like', '%' . $request->plaque . '%');
            $manifests->where('plaque', 'like', '%' . $request->plaque . '%');
            $mouvements->where('plaque', 'like', '%' . $request->plaque . '%');
        }
        if ($request->filled('importateur')) {
            $dossiers->where('importateur', 'like', '%' . $request->importateur . '%');
            $mouvements->where('importateur', 'like', '%' . $request->importateur . '%');
        }
        if ($request->filled('date')) {
            $dossiers->whereDate('created_at', $request->date);
            $manifests->whereDate('created_at', $request->date);
            $mouvements->whereDate('created_at', $request->date);
        }
        if ($request->filled('statut')) {
            $dossiers->where('status', $request->statut);
            $manifests->where('status', $request->statut);
        }
        if ($request->filled('bureau')) {
            $dossiers->where('bureau_repr', 'like', '%' . $request->bureau . '%');
            $manifests->where('bureau_id', 'like', '%' . $request->bureau . '%');
        }

        return response()->json([
            'dossiers' => $dossiers->get(),
            'manifests' => $manifests->get(),
            'mouvements' => $mouvements->get(),
        ]);
    }
}
