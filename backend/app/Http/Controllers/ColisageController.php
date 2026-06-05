<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ColisageAffectation;
use App\Models\RapportColisage;
use App\Models\Dossier;
use App\Models\Alerte;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ColisageController extends Controller
{
    /**
     * List all colisage assignments.
     */
    public function indexAffectations(Request $request)
    {
        $user = $request->user();
        $query = ColisageAffectation::with(['dossier', 'agent', 'chef']);

        if ($user->role === 'agent_pointage') {
            $query->where('agent_id', $user->id);
        } elseif (in_array($user->role, ['chef_entrepot_douane', 'chef_entrepot_log'])) {
            $query->where('chef_entrepot_douane_id', $user->id);
        }

        return response()->json($query->orderBy('date_affectation', 'desc')->get());
    }

    /**
     * Assign a pointage agent to a dossier.
     */
    public function storeAffectation(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'dossier_id' => 'required|string|exists:dossiers,id',
            'agent_id' => 'required|integer|exists:users,id',
        ]);

        // Remove previous assignment for this dossier if any
        ColisageAffectation::where('dossier_id', $request->input('dossier_id'))->delete();

        $assignment = ColisageAffectation::create([
            'dossier_id' => $request->input('dossier_id'),
            'agent_id' => $request->input('agent_id'),
            'chef_entrepot_douane_id' => $user->id,
            'date_affectation' => now(),
            'statut' => 'affecte',
        ]);

        $agent = User::find($request->input('agent_id'));

        // Notify the assigned agent
        Alerte::create([
            'recipient_id' => $agent->id,
            'type' => 'systeme',
            'title' => 'Affectation de Colisage',
            'message' => "Vous avez été affecté pour effectuer le pointage/colisage du dossier {$assignment->dossier_id}.",
            'reference_id' => $assignment->dossier_id,
        ]);

        return response()->json($assignment->load(['dossier', 'agent']), 201);
    }

    /**
     * List packing list reports.
     */
    public function indexRapports(Request $request)
    {
        $user = $request->user();
        $query = RapportColisage::with(['dossier', 'agent', 'validateur']);

        if ($user->role === 'agent_pointage') {
            $query->where('agent_id', $user->id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Submit a new packing list report.
     */
    public function storeRapport(Request $request)
    {
        $request->validate([
            'dossier_id' => 'required|string|exists:dossiers,id',
            'lignes' => 'required|array|min:1',
            'lignes.*.description' => 'nullable|string',
            'lignes.*.quantite' => 'required|integer|min:1',
            'lignes.*.poidsParColis' => 'required|numeric|min:0',
            'lignes.*.poidsTotal' => 'required|numeric|min:0',
            'total_quantite' => 'required|integer',
            'total_poids' => 'required|numeric',
            'notes' => 'nullable|string',
        ]);

        $agent = $request->user();

        DB::beginTransaction();
        try {
            // Remove old report for this dossier if any
            RapportColisage::where('dossier_id', $request->input('dossier_id'))->delete();

            $rapport = RapportColisage::create([
                'dossier_id' => $request->input('dossier_id'),
                'agent_id' => $agent->id,
                'date_creation' => now(),
                'date_soumission' => now(),
                'lignes' => $request->input('lignes'),
                'total_quantite' => $request->input('total_quantite'),
                'total_poids' => $request->input('total_poids'),
                'notes' => $request->input('notes'),
                'statut' => 'soumis',
            ]);

            // Notify Chef d'entrepot / Inspector
            Alerte::create([
                'target_role' => 'chef_entrepot_douane',
                'type' => 'systeme',
                'title' => 'Rapport Colisage Soumis',
                'message' => "Un rapport de colisage a été soumis par l'agent {$agent->full_name} pour le dossier {$rapport->dossier_id}.",
                'reference_id' => $rapport->dossier_id,
            ]);

            DB::commit();

            return response()->json($rapport->load('dossier'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la soumission du rapport.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate or reject a packing list report.
     */
    /**
     * Get rapport by dossier ID.
     */
    public function showRapportByDossier($dossierId)
    {
        $rapport = RapportColisage::with(['dossier', 'agent', 'validateur'])
            ->where('dossier_id', $dossierId)
            ->first();

        if (!$rapport) {
            return response()->json(['message' => 'Aucun rapport trouvé pour ce dossier.'], 404);
        }

        return response()->json($rapport);
    }

    public function updateRapportStatus(Request $request, $id)
    {
        $user = $request->user();
        $request->validate([
            'statut' => 'required|string|in:valide,rejete',
            'notes_chef' => 'nullable|string',
            'lignes_chef' => 'nullable|array',
            'motif_rejet' => 'required_if:statut,rejete|nullable|string',
        ]);

        $rapport = RapportColisage::findOrFail($id);
        $dossier = Dossier::findOrFail($rapport->dossier_id);

        DB::beginTransaction();
        try {
            $rapport->statut = $request->input('statut');
            $rapport->notes_chef = $request->input('notes_chef');
            $rapport->validated_by = $user->id;
            $rapport->validated_at = now();
            if ($request->input('statut') === 'rejete') {
                $rapport->motif_rejet = $request->input('motif_rejet');
            }
            if ($request->has('lignes_chef')) {
                $rapport->lignes_chef = $request->input('lignes_chef');
            }
            $rapport->save();

            // Update dossier status based on validation result
            if ($rapport->statut === 'valide') {
                $dossier->status = 'verifie';
                $dossier->save();
            }

            // Notify checking agent
            Alerte::create([
                'recipient_id' => $rapport->agent_id,
                'type' => 'systeme',
                'title' => "Rapport Colisage " . ($rapport->statut === 'valide' ? 'Validé' : 'Rejeté'),
                'message' => "Votre rapport de colisage pour le dossier {$rapport->dossier_id} a été " . ($rapport->statut === 'valide' ? 'validé' : 'rejeté') . " par le chef." . ($rapport->motif_rejet ? " Motif : {$rapport->motif_rejet}" : ""),
                'reference_id' => $rapport->dossier_id,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Rapport mis à jour avec succès.',
                'rapport' => $rapport->load(['dossier', 'agent', 'validateur']),
                'dossier_status' => $dossier->status
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du statut.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
