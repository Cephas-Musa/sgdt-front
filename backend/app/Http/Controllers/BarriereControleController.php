<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BarriereControle;
use App\Models\User;

class BarriereControleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = BarriereControle::with(['brigadier:id,full_name,role', 'dossiers']);

        if (!in_array($user->role, ['super_admin', 'inspecteur_chef'])) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'entite' => 'required|string|max:255',
            'brigadier_id' => 'nullable|exists:users,id',
        ]);

        if ($request->filled('brigadier_id')) {
            $brigadier = User::findOrFail($request->brigadier_id);
            if ($brigadier->role !== 'brigadier_controle') {
                return response()->json(['message' => 'L\'utilisateur sélectionné n\'est pas un Brigadier Contrôle.'], 422);
            }
        }

        $barriere = BarriereControle::create([
            'nom' => $request->nom,
            'entite' => $request->entite,
            'brigadier_id' => $request->brigadier_id,
        ]);

        return response()->json($barriere->load('brigadier:id,full_name,role'), 201);
    }

    public function show(Request $request, $id)
    {
        $barriere = BarriereControle::with(['brigadier:id,full_name,role', 'dossiers.brigadier:id,full_name'])->findOrFail($id);
        return response()->json($barriere);
    }

    public function update(Request $request, $id)
    {
        $barriere = BarriereControle::findOrFail($id);

        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'entite' => 'sometimes|required|string|max:255',
            'brigadier_id' => 'sometimes|nullable|exists:users,id',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if ($request->filled('brigadier_id')) {
            $brigadier = User::findOrFail($request->brigadier_id);
            if ($brigadier->role !== 'brigadier_controle') {
                return response()->json(['message' => 'L\'utilisateur sélectionné n\'est pas un Brigadier Contrôle.'], 422);
            }
        }

        $barriere->update($request->only(['nom', 'entite', 'brigadier_id', 'status']));

        return response()->json($barriere->load('brigadier:id,full_name,role'));
    }

    public function destroy($id)
    {
        $barriere = BarriereControle::findOrFail($id);
        $barriere->delete();

        return response()->json(['message' => 'Barrière désactivée avec succès.']);
    }

    public function activities(Request $request, $id)
    {
        $barriere = BarriereControle::with('brigadier:id,full_name')->findOrFail($id);

        $query = $barriere->dossiers()->with(['brigadier:id,full_name', 'signataires'])->orderBy('created_at', 'desc');

        $totalDossiers = $query->count();
        $dossiersDuJour = (clone $query)->whereDate('created_at', today())->count();
        $dossiersSemaine = (clone $query)->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();
        $dossiersAutorisation = (clone $query)->where('autorisation_speciale', true)->count();

        $allDossiers = $barriere->dossiers()->with(['brigadier:id,full_name', 'signataires'])->orderBy('created_at', 'desc')->get();

        return response()->json([
            'barriere' => $barriere->nom,
            'brigadier' => $barriere->brigadier?->full_name,
            'total_dossiers' => $totalDossiers,
            'dossiers_du_jour' => $dossiersDuJour,
            'dossiers_semaine' => $dossiersSemaine,
            'dossiers_autorisation_speciale' => $dossiersAutorisation,
            'dossiers' => $allDossiers,
        ]);
    }

    public function dossiers(Request $request, $id)
    {
        $barriere = BarriereControle::findOrFail($id);

        $query = $barriere->dossiers()->with(['brigadier:id,full_name', 'signataires']);

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }
}
