<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Denombrement;
use App\Services\AlerteService;

class DenombrementController extends Controller
{
    protected $alerteService;

    public function __construct(AlerteService $alerteService)
    {
        $this->alerteService = $alerteService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Denombrement::with(['user', 'chef']);

        // Filtrer selon le rôle
        if (in_array($user->role, ['chef_entrepot_douane', 'chef_entrepot_prive'])) {
            $query->where('entrepot_id', $user->entrepot_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('entrepot_id')) {
            $query->where('entrepot_id', $request->input('entrepot_id'));
        }

        return response()->json($query->orderBy('date_denombrement', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'reference' => 'required|string|unique:denombrements,reference',
            'entrepot_id' => 'required|string',
            'date_denombrement' => 'required|date',
            'quantite_theorique' => 'required|integer|min:0',
        ]);

        $denombrement = Denombrement::create([
            'reference' => $request->reference,
            'entrepot_id' => $request->entrepot_id,
            'date_denombrement' => $request->date_denombrement,
            'quantite_theorique' => $request->quantite_theorique,
            'quantite_comptabilisee' => 0,
            'status' => 'planifie',
            'user_id' => $request->user()->id,
        ]);

        $this->alerteService->createSupervisorAlert(
            'DENOM-' . $denombrement->id,
            'denombrement_cree',
            'Dénombrement planifié',
            'Un nouveau dénombrement a été planifié pour ' . $denombrement->entrepot_id,
            $request->user()->id
        );

        return response()->json(['message' => 'Dénombrement créé.', 'denombrement' => $denombrement], 201);
    }

    public function show(Request $request, $id)
    {
        $denombrement = Denombrement::with(['user', 'chef'])->findOrFail($id);
        return response()->json($denombrement);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:planifie,en_cours,valide',
            'quantite_comptabilisee' => 'required|integer|min:0',
        ]);

        $denombrement = Denombrement::findOrFail($id);
        $denombrement->update([
            'status' => $request->status,
            'quantite_comptabilisee' => $request->quantite_comptabilisee,
            'difference' => $request->quantite_comptabilisee - $denombrement->quantite_theorique,
        ]);

        // Créer une alerte si différence
        if ($denombrement->difference !== 0) {
            $this->alerteService->createSupervisorAlert(
                'DENOM-' . $denombrement->id,
                'anomalie_colisage',
                'Anomalie de dénombrement',
                'Différence de ' . abs($denombrement->difference) . ' articles détectée',
                $request->user()->id
            );
        }

        return response()->json(['message' => 'Dénombrement mis à jour.', 'denombrement' => $denombrement]);
    }

    public function approve(Request $request, $id)
    {
        $denombrement = Denombrement::findOrFail($id);

        if ($denombrement->status !== 'valide') {
            return response()->json(['message' => 'Seul un dénombrement validé peut être approuvé.'], 400);
        }

        $denombrement->update([
            'approuve_par_chef' => true,
            'chef_id' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Dénombrement approuvé.', 'denombrement' => $denombrement]);
    }
}
