<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vrac;
use App\Services\AlerteService;

class VracController extends Controller
{
    protected $alerteService;

    public function __construct(AlerteService $alerteService)
    {
        $this->alerteService = $alerteService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Vrac::query();

        // Filtrer selon le rôle
        if (in_array($user->role, ['inspecteur_chef_bureau', 'inspecteur_chef', 'secretaire_inspecteur'])) {
            $query->whereHas('user', function($q) use ($user) {
                $q->where('bureau', $user->bureau);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'reference' => 'required|string|unique:vracs,reference',
            'dossier_id' => 'nullable|string',
            'type' => 'required|in:direct,transbordement',
            'importateur' => 'required|string',
            'plaque' => 'required|string',
            'quantite' => 'required|integer|min:1',
            'poids' => 'required|numeric|min:0',
        ]);

        $vrac = Vrac::create([
            'reference' => $request->reference,
            'dossier_id' => $request->dossier_id,
            'type' => $request->type,
            'importateur' => $request->importateur,
            'plaque' => $request->plaque,
            'quantite' => $request->quantite,
            'poids' => $request->poids,
            'status' => 'cree',
            'user_id' => $request->user()->id,
        ]);

        // Créer une alerte
        $this->alerteService->createSupervisorAlert(
            $vrac->dossier_id ?? 'VRAC-' . $vrac->id,
            'vrac_cree',
            'Nouveau vrac créé',
            'Un nouveau vrac ' . $vrac->reference . ' a été créé par ' . $request->user()->full_name,
            $request->user()->id
        );

        return response()->json(['message' => 'Vrac créé avec succès.', 'vrac' => $vrac], 201);
    }

    public function show(Request $request, $id)
    {
        $vrac = Vrac::findOrFail($id);

        $this->authorize('view', $vrac);

        return response()->json($vrac->load(['user', 'dossier']));
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:cree,valide,en_cours,termine',
        ]);

        $vrac = Vrac::findOrFail($id);
        $oldStatus = $vrac->status;

        $vrac->update(['status' => $request->status]);

        // Créer une alerte
        $this->alerteService->createSupervisorAlert(
            $vrac->dossier_id ?? 'VRAC-' . $vrac->id,
            'vrac_status_change',
            'Statut vrac modifié',
            'Vrac ' . $vrac->reference . ': ' . $oldStatus . ' → ' . $request->status,
            $request->user()->id
        );

        return response()->json(['message' => 'Statut mis à jour.', 'vrac' => $vrac]);
    }
}
