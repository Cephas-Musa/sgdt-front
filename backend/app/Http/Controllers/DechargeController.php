<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Decharge;
use App\Services\AlerteService;

class DechargeController extends Controller
{
    protected $alerteService;

    public function __construct(AlerteService $alerteService)
    {
        $this->alerteService = $alerteService;
    }

    public function index(Request $request)
    {
        $query = Decharge::with(['user', 'dossier', 'entrepot']);

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('entrepot_id')) {
            $query->where('entrepot_id', $request->input('entrepot_id'));
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'reference' => 'required|string|unique:dechargements,reference',
            'dossier_id' => 'nullable|string',
            'entrepot_id' => 'required|string',
            'quantite_attendue' => 'required|integer|min:0',
        ]);

        $decharge = Decharge::create([
            'reference' => $request->reference,
            'dossier_id' => $request->dossier_id,
            'entrepot_id' => $request->entrepot_id,
            'quantite_attendue' => $request->quantite_attendue,
            'status' => 'planifie',
            'user_id' => $request->user()->id,
        ]);

        $this->alerteService->createSupervisorAlert(
            $request->dossier_id ?? 'DECH-' . $decharge->id,
            'decharge_planifiee',
            'Décharge planifiée',
            'Une décharge a été planifiée pour ' . $request->entrepot_id,
            $request->user()->id
        );

        return response()->json(['message' => 'Décharge créée.', 'decharge' => $decharge], 201);
    }

    public function show($id)
    {
        $decharge = Decharge::with(['user', 'dossier', 'entrepot'])->findOrFail($id);
        return response()->json($decharge);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:planifie,en_cours,termine',
            'quantite_reelle' => 'nullable|integer|min:0',
        ]);

        $decharge = Decharge::findOrFail($id);
        $decharge->update([
            'status' => $request->status,
            'quantite_reelle' => $request->quantite_reelle ?? $decharge->quantite_reelle,
            'date_decharge' => $request->status === 'termine' ? now() : $decharge->date_decharge,
        ]);

        // Alerte si différence
        if ($decharge->quantite_reelle !== $decharge->quantite_attendue) {
            $this->alerteService->createSupervisorAlert(
                $decharge->dossier_id ?? 'DECH-' . $decharge->id,
                'anomalie_decharge',
                'Anomalie de décharge',
                'Différence détectée: attendu ' . $decharge->quantite_attendue . ', reçu ' . $decharge->quantite_reelle,
                $request->user()->id
            );
        }

        return response()->json(['message' => 'Décharge mise à jour.', 'decharge' => $decharge]);
    }
}
