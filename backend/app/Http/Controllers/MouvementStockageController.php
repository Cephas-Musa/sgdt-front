<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MouvementStockage;
use App\Services\AlerteService;

class MouvementStockageController extends Controller
{
    protected $alerteService;

    public function __construct(AlerteService $alerteService)
    {
        $this->alerteService = $alerteService;
    }

    public function index(Request $request)
    {
        $query = MouvementStockage::with(['user', 'dossier', 'entrepot']);

        if ($request->has('entrepot_id')) {
            $query->where('entrepot_id', $request->input('entrepot_id'));
        }

        if ($request->has('type_mouvement')) {
            $query->where('type_mouvement', $request->input('type_mouvement'));
        }

        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('date_mouvement', [
                $request->input('date_from'),
                $request->input('date_to')
            ]);
        }

        return response()->json($query->orderBy('date_mouvement', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'dossier_id' => 'nullable|string',
            'entrepot_id' => 'required|string',
            'espace_id' => 'nullable|string',
            'type_mouvement' => 'required|in:entree,sortie,transbordement,changement_localisation',
            'quantite' => 'required|integer|min:0',
            'poids' => 'required|numeric|min:0',
        ]);

        $mouvement = MouvementStockage::create([
            'dossier_id' => $request->dossier_id,
            'entrepot_id' => $request->entrepot_id,
            'espace_id' => $request->espace_id,
            'type_mouvement' => $request->type_mouvement,
            'quantite' => $request->quantite,
            'poids' => $request->poids,
            'observations' => $request->observations,
            'user_id' => $request->user()->id,
        ]);

        // Vérifier les alertes entrepôt
        $warehouseAlerts = $this->alerteService->checkWarehouseAlerts($request->entrepot_id);
        foreach ($warehouseAlerts as $alert) {
            $this->alerteService->createRoleAlert(
                $request->dossier_id ?? 'MOVE-' . $mouvement->id,
                $alert['type'],
                $alert['type'],
                $alert['message'],
                ['chef_entrepot_douane', 'chef_entrepot_prive', 'inspecteur_chef_bureau']
            );
        }

        return response()->json(['message' => 'Mouvement enregistré.', 'mouvement' => $mouvement], 201);
    }

    public function show($id)
    {
        $mouvement = MouvementStockage::with(['user', 'dossier', 'entrepot'])->findOrFail($id);
        return response()->json($mouvement);
    }
}
