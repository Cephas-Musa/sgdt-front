<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Dossier;
use App\Models\Article;
use App\Models\Alerte;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DossierController extends Controller
{
    public function __construct(
        protected \App\Services\DossierWorkflowService $workflowService,
        protected \App\Services\DossierAccessService $accessService
    ) {}

    public function index(Request $request)
    {
        $dossiers = $this->accessService->getActiveDossiers($request->user());

        $dossiers = $dossiers->map(function($dossier) {
            return $dossier->toArray();
        })->values();

        return response()->json($dossiers);
    }

    /**
     * Recherche un dossier spécifique par référence
     */
    public function search(Request $request, string $reference)
    {
        $dossier = $this->accessService->searchByReference($reference, $request->user());

        if (!$dossier) {
            return response()->json(['message' => 'Dossier introuvable ou accès non autorisé.'], 404);
        }

        return response()->json($dossier);
    }

    /**
     * Récupère l'historique récent des dossiers traités/consultés
     */
    public function history(Request $request)
    {
        $dossiers = $this->accessService->getUserHistory($request->user());
        return response()->json($dossiers);
    }

    /**
     * Obtenir la prochaine référence générée
     */
    public function nextReference(Request $request)
    {
        $user = $request->user();
        $prefix = $user->role === 'operateur_saisie' ? 'RD-OP-' : 'RD-';
        return response()->json(['reference' => \App\Services\ReferenceGeneratorService::generate($prefix)]);
    }

    /**
     * Création d'un dossier avec ses articles associés
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // On permet à l'inspecteur chef, inspecteur, super_admin, operateur de saisie de créer le dossier
        // Le secretaire_inspecteur n'a pas le droit de créer des dossiers (règle stricte)
        if (!in_array($user->role, ['inspecteur_chef_bureau', 'inspecteur_chef', 'inspecteur', 'super_admin', 'operateur_saisie', 'chef_bureau_repr'])) {
            return response()->json(['message' => 'Non autorisé. Seul un inspecteur ou le bureau de représentation peut créer un dossier.'], 403);
        }

        $request->validate([
            'type_dossier_id' => 'nullable|string',
            'reference_douane' => 'nullable|string',
            'importateur' => 'nullable|string|max:255',
            'declarant' => 'nullable|string|max:255',
            'localisation' => 'nullable|string|max:255',
            'quantite' => 'nullable|integer',
            'poids' => 'nullable|numeric',
            'colis' => 'nullable|integer',
            'devise' => 'nullable|string|max:3',
            'bureau_id' => 'nullable|string',
            'metadata' => 'nullable|array',
            'attachments' => 'nullable|array',
            'dra' => 'nullable|string|max:255',
            't1' => 'nullable|string|max:255',
        ]);

        $dossierData = $request->except(['articles']);
        $tarif = 0;

        if ($request->filled('type_dossier_id')) {
            $typeDossier = \App\Models\TypeDossier::findOrFail($request->input('type_dossier_id'));
            $tarif = floatval($typeDossier->tarif);

            if (floatval($user->wallet_balance) < $tarif) {
                return response()->json(['message' => 'Solde insuffisant pour ce dossier.'], 400);
            }

            $dossierData['type'] = $typeDossier->code;
            $dossierData['montant'] = $typeDossier->tarif;
            $dossierData['devise'] = $typeDossier->devise ?? 'USD';
        }

        $dossierData['bureau_id'] = $request->input('bureau_id') ?? ($user->bureau_id ?? '1');

        $dossierData['created_by'] = $user->id;
        $dossierData['inspecteur_id'] = $user->id;
        $dossierData['status'] = \App\Enums\DossierStatus::EN_COURS;

        if ($request->has('extra_data')) {
            $dossierData['extra_data'] = $request->input('extra_data');
        } else {
            $dossierData['extra_data'] = [];
        }

        if ($request->has('titres_details')) {
            $dossierData['extra_data']['titres_details'] = $request->input('titres_details');
        }
        if ($request->has('declarations_details')) {
            $dossierData['extra_data']['declarations_details'] = $request->input('declarations_details');
        }

        $prefix = $user->role === 'operateur_saisie' ? 'RD-OP-' : 'RD-';
        $dossierData['reference'] = \App\Services\ReferenceGeneratorService::generate($prefix);

        DB::beginTransaction();

        try {
            $dossier = Dossier::create($dossierData);

            if ($request->has('articles')) {
                foreach ($request->input('articles') as $articleData) {
                    $dossier->articles()->create($articleData);
                }
            }

            // Déduction du solde de l'inspecteur et historisation du paiement
            if ($tarif > 0) {
                $user->wallet_balance = floatval($user->wallet_balance) - $tarif;
                $user->save();

                // Création de la transaction pour traçabilité du paiement
                \App\Models\Transaction::create([
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'dossier_id' => $dossier->id,
                    'user_id' => $user->id,
                    'amount' => $tarif,
                    'currency' => $dossierData['devise'],
                    'type' => 'frais_creation_dossier',
                    'status' => 'completed',
                    'reference' => 'TXN-' . strtoupper(uniqid()),
                ]);
            }

            // Historiser la création
            \App\Services\AuditLogService::log('dossier', 'create', $dossier->id, null, $dossier->toArray());

            // Update User History
            app(\App\Services\DossierAccessService::class)->logHistory($user->id, $dossier, 'creation', 'dossier');

            DB::commit();

            return response()->json($dossier->load('articles'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la création du dossier.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Affichage des détails d'un dossier
     */
    public function show($id)
    {
        $dossier = Dossier::with(['articles', 'creator', 'inspecteur', 'secretary', 'workflows', 'timelines', 'documents'])->findOrFail($id);

        // toArray() already includes formatted_data through the accessor
        return response()->json($dossier->toArray());
    }

    /**
     * "Super Endpoint" : Centre de supervision du dossier avec tous les filtres métier
     */
    public function details(Request $request, $id)
    {
        $dossier = Dossier::with([
            'creator',
            'inspecteur',
            'secretary',
            'typeDossier',
            'articles',
            'timelines.user',
            'workflows',
            'validations.validator',
            'anomalies',
            'documents',
            'mouvements',
            'vracs',
            'decharges',
            'mouvementsStockage',
            'colisages',
            'empty_manifests',
            'barriere_entries',
            'typingDocsDirect.typingOperator',
            'typingDocsTranshipment.typingOperator',
            'itEntries.typingOperator',
        ])->findOrFail($id);

        $user = $request->user();

        $allowedRoles = [
            'super_admin', 'directeur', 'directeur_provincial',
            'inspecteur_chef', 'inspecteur', 'secretaire_inspecteur', 'agent_controle',
            'verificateur', 'chef_bureau_repr', 'operateur_saisie',
            'agent_pointage', 'typing_operator', 'chef_barriere',
        ];

        if (!in_array($user->role, $allowedRoles)) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        return response()->json($dossier);
    }

    /**
     * "Aggregate Endpoint" : Retourne le dossier inspecteur combiné aux données logiques du Bureau Représentation
     */
    public function aggregate(Request $request, $id)
    {
        $dossier = Dossier::with([
            'creator',
            'inspecteur',
            'secretary',
            'typeDossier',
            'articles',
            'timelines.user',
            'workflows',
            'validations.validator',
            'anomalies',
            'documents',
            'mouvements',
            'vracs',
            'decharges',
            'mouvementsStockage',
            'colisages',
            'empty_manifests',
            'barriere_entries',
            'typingDocsDirect.typingOperator',
            'typingDocsTranshipment.typingOperator',
            'itEntries.typingOperator',
        ])->findOrFail($id);

        $user = $request->user();
        $allowedRoles = [
            'super_admin', 'directeur', 'directeur_provincial',
            'inspecteur_chef', 'inspecteur', 'secretaire_inspecteur', 'agent_controle',
            'verificateur', 'chef_bureau_repr', 'operateur_saisie',
            'agent_pointage', 'typing_operator', 'chef_barriere',
        ];

        if (!in_array($user->role, $allowedRoles)) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $representationData = app(\App\Services\DossierSyncService::class)->findRepresentationDataByDra($dossier->dra);

        return response()->json([
            'dossier' => $dossier,
            'representation_data' => $representationData ? $representationData['representation_data'] : null,
            'representation_articles' => $representationData ? $representationData['representation_articles'] : [],
            'representation_history' => $representationData ? $representationData['representation_history'] : []
        ]);
    }

    /**
     * Mise à jour du dossier (champs simples)
     */
    public function update(Request $request, $id)
    {
        $dossier = Dossier::findOrFail($id);
        $oldData = $dossier->toArray();
        $user = $request->user();
        $payload = $request->all();

        // Les secrétaires ne peuvent qu'ajouter des données manquantes,
        // pas modifier les données déjà entrées par l'inspecteur.
        if ($user->role === 'secretaire_inspecteur') {
            foreach ($payload as $key => $value) {
                if (!empty($oldData[$key]) && $key !== 'extra_data' && $key !== 'articles') {
                    unset($payload[$key]);
                }
            }
            if (isset($payload['extra_data']) && is_array($payload['extra_data'])) {
                $oldExtra = $dossier->extra_data ?? [];
                foreach ($oldExtra as $extraKey => $extraValue) {
                    if (!empty($extraValue) && isset($payload['extra_data'][$extraKey])) {
                        $payload['extra_data'][$extraKey] = $extraValue;
                    }
                }
            }
        }

        $dossier->update($payload);

        // Run all consistency checks and trigger alerts if inconsistencies are found
        app(\App\Services\AlerteService::class)->runAllConsistencyChecks($dossier->id, $user->id);

        \App\Services\AuditLogService::log('dossier', 'update', $dossier->id, $oldData, $dossier->toArray());

        // Update User History
        app(\App\Services\DossierAccessService::class)->logHistory($user->id, $dossier, 'modification', 'dossier');

        return response()->json($dossier->load('articles'));
    }

    /**
     * Mise à jour du statut d'un dossier via State Machine
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
            'commentaire' => 'nullable|string'
        ]);

        $dossier = Dossier::findOrFail($id);
        $newStatus = \App\Enums\DossierStatus::tryFrom($request->input('status'));

        if (!$newStatus) {
            return response()->json(['message' => 'Statut invalide.'], 400);
        }

        // Le secrétaire ne peut pas clôturer un dossier
        if ($request->user()->role === 'secretaire_inspecteur' && in_array($newStatus->value, [\App\Enums\DossierStatus::TERMINE->value, \App\Enums\DossierStatus::APPUREMENT_FINAL->value])) {
            return response()->json(['message' => 'Action non autorisée. Seul l\'inspecteur peut clôturer un dossier.'], 403);
        }

        try {
            $this->workflowService->transition($dossier, $newStatus, $request->user()->id, $request->input('commentaire'));
            
            // Update User History
            app(\App\Services\DossierAccessService::class)->logHistory($request->user()->id, $dossier, 'status_update', 'dossier');

            return response()->json([
                'message' => 'Statut mis à jour avec succès.',
                'dossier' => $dossier->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Suppression d'un dossier
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!in_array($user->role, ['directeur_provincial', 'directeur_general', 'inspecteur_chef', 'inspecteur', 'super_admin'])) {
            return response()->json(['message' => 'Action non autorisée. Seul l\'inspecteur, DP, et le DG peuvent supprimer un dossier.'], 403);
        }

        $request->validate(['delete_reason' => 'required|string']);

        $dossier = Dossier::findOrFail($id);
        
        $dossier->update([
            'deleted_by' => $user->id,
            'delete_reason' => $request->input('delete_reason'),
        ]);

        $dossier->delete();

        \App\Services\AuditLogService::log('dossier', 'delete', $id, $dossier->toArray(), null);

        return response()->json(['message' => 'Dossier supprimé avec succès.']);
    }
}
