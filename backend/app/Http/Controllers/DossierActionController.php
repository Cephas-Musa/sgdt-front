<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Dossier;
use App\Models\DossierAnomaly;
use App\Models\DossierValidation;
use App\Services\DossierTimelineService;
use App\Services\AlerteService;

class DossierActionController extends Controller
{
    /**
     * Secrétaire Inspecteur : Compléter le dossier (DRA, T1, etc.)
     */
    public function updateInfos(Request $request, $id)
    {
        $dossier = Dossier::findOrFail($id);
        $user = $request->user();

        // RBAC Check : Secrétaire assigné, ou Inspecteur
        if ($user->role === 'secretaire_inspecteur' && $dossier->secretary_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $request->validate([
            'dra' => 'sometimes|string',
            't1' => 'sometimes|string',
            'importateur' => 'sometimes|string',
        ]);

        $dossier->update($request->only(['dra', 't1', 'importateur']));

        DossierTimelineService::log(
            $dossier->id,
            $user->id,
            'MISE_A_JOUR_INFOS',
            'secretariat',
            'Le dossier a été complété avec de nouvelles informations administratives.'
        );

        return response()->json(['message' => 'Dossier mis à jour.', 'dossier' => $dossier]);
    }

    /**
     * Vérificateur : Soumettre un rapport de vérification
     */
    public function submitVerification(Request $request, $id)
    {
        $dossier = Dossier::findOrFail($id);
        $user = $request->user();

        if ($user->role !== 'verificateur') {
            return response()->json(['message' => 'Non autorisé. Rôle vérificateur requis.'], 403);
        }

        $request->validate([
            'validation_type' => 'required|string', // PHYSICAL_INSPECTION, DOCUMENT_REVIEW, etc.
            'status' => 'required|string', // APPROVED, REJECTED, PENDING
            'observation' => 'required|string',
        ]);

        $validation = DossierValidation::create([
            'dossier_id' => $dossier->id,
            'validated_by' => $user->id,
            'validation_type' => $request->validation_type,
            'status' => $request->status,
            'observation' => $request->observation,
            'validated_ip' => $request->ip(),
            'validated_device' => $request->userAgent(),
            'validated_at' => now(),
        ]);

        DossierTimelineService::log(
            $dossier->id,
            $user->id,
            'VERIFICATION_SOUMISE',
            'verification',
            'Rapport de vérification déposé (Statut: ' . $request->status . ').'
        );

        return response()->json(['message' => 'Vérification enregistrée.', 'validation' => $validation]);
    }

    /**
     * Agent Cellule Contrôle : Lever une anomalie
     */
    public function flagAnomaly(Request $request, $id)
    {
        $dossier = Dossier::findOrFail($id);
        $user = $request->user();

        if ($user->role !== 'agent_cellule_controle') {
            return response()->json(['message' => 'Non autorisé. Cellule de contrôle uniquement.'], 403);
        }

        $request->validate([
            'type' => 'required|string',
            'severity' => 'required|string', // HIGH, MEDIUM, LOW
            'description' => 'required|string',
        ]);

        $anomaly = DossierAnomaly::create([
            'dossier_id' => $dossier->id,
            'type' => $request->type,
            'severity' => $request->severity,
            'description' => $request->description,
            'detected_by' => $user->id,
            'resolved' => false,
        ]);

        DossierTimelineService::log(
            $dossier->id,
            $user->id,
            'ANOMALIE_LEVEE',
            'controle',
            'Une anomalie a été détectée : ' . $request->type
        );

        // Déclencher l'alerte
        AlerteService::triggerAnomalyAlert($dossier, $anomaly, $user);

        return response()->json(['message' => 'Anomalie enregistrée.', 'anomaly' => $anomaly]);
    }

    /**
     * Opérateur Saisie : Ajouter des données de représentation
     */
    public function addRepresentationData(Request $request, $id)
    {
        $dossier = Dossier::findOrFail($id);
        $user = $request->user();

        if ($user->role !== 'operateur_saisie') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $request->validate([
            'devise' => 'required|string|size:3',
            'montant' => 'required|numeric',
            'articles' => 'required|array|min:1',
        ]);

        $dossier->update($request->only(['devise', 'montant']));

        foreach ($request->articles as $article) {
            $dossier->articles()->create($article);
        }

        DossierTimelineService::log(
            $dossier->id,
            $user->id,
            'AJOUT_DONNEES_REPRESENTATION',
            'representation',
            'Données de représentation et articles ajoutés.'
        );

        return response()->json(['message' => 'Données de représentation ajoutées.']);
    }

    /**
     * Typing Operator / Brigadier : Lier des données de barrière ou manifeste au dossier
     */
    public function linkBarriereData(Request $request, $id)
    {
        $dossier = Dossier::findOrFail($id);
        $user = $request->user();

        // RBAC: doit être un typing_operator ou brigadier
        if (!in_array($user->role, ['typing_operator', 'brigadier_barriere'])) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $request->validate([
            'barriere_entry_id' => 'nullable|string|exists:barriere_entries,id',
            'empty_manifest_id' => 'nullable|string|exists:empty_manifests,id',
        ]);

        if ($request->barriere_entry_id) {
            \App\Models\BarriereEntry::where('id', $request->barriere_entry_id)
                ->update(['dossier_id' => $dossier->id]);
            
            DossierTimelineService::log(
                $dossier->id,
                $user->id,
                'LIAISON_BARRIERE',
                'barriere',
                'Entrée barrière liée au dossier.'
            );
        }

        if ($request->empty_manifest_id) {
            \App\Models\EmptyManifest::where('id', $request->empty_manifest_id)
                ->update(['dossier_id' => $dossier->id]);
            
            DossierTimelineService::log(
                $dossier->id,
                $user->id,
                'LIAISON_MANIFESTE',
                'manifeste',
                'Empty Manifest lié au dossier.'
            );
        }

        return response()->json(['message' => 'Données barrière liées au dossier.']);
    }
}
