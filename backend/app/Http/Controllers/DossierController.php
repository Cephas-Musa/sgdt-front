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
    /**
     * Liste des dossiers filtrés par les privilèges du rôle
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Dossier::with(['articles', 'user']);

        // Filtrage selon le rôle
        if (in_array($user->role, ['directeur_provincial'])) {
            if ($user->province) {
                // Filtrer par province de l'utilisateur (le dossier a une localisation ou province)
                $query->where('localisation', 'LIKE', '%' . $user->province . '%');
            }
        } elseif (in_array($user->role, ['chef_bureau', 'inspecteur_chef', 'agent_controle'])) {
            if ($user->bureau) {
                $query->where('bureau_repr', $user->bureau);
            }
        }

        // Filtres de recherche optionnels
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('id', 'LIKE', "%{$search}%")
                  ->orWhere('reference', 'LIKE', "%{$search}%")
                  ->orWhere('reference_douane', 'LIKE', "%{$search}%")
                  ->orWhere('importateur', 'LIKE', "%{$search}%")
                  ->orWhere('plaque', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        $dossiers = $query->orderBy('created_at', 'desc')->get();

        return response()->json($dossiers);
    }

    /**
     * Création d'un dossier avec ses articles associés
     */
    public function store(Request $request)
    {
        $request->validate([
            'id' => 'required|string|unique:dossiers,id',
            'reference' => 'required|string|unique:dossiers,reference',
            'reference_douane' => 'required|string',
            'type' => 'required|string',
            'importateur' => 'required|string|max:255',
            'exportateur' => 'nullable|string|max:255',
            'declarant' => 'required|string|max:255',
            'nif' => 'nullable|string|max:50',
            'dra' => 'required|string',
            't1' => 'required|string',
            'vehicule' => 'required|string|max:100',
            'plaque' => 'required|string|max:50',
            'pays' => 'required|string|max:100',
            'provenance' => 'required|string|max:100',
            'destination' => 'required|string|max:100',
            'localisation' => 'required|string|max:255',
            'type_marchandises' => 'required|string|max:255',
            'quantite' => 'required|integer',
            'poids' => 'required|numeric',
            'colis' => 'required|integer',
            'devise' => 'required|string|size:3',
            'status' => 'nullable|string',
            'montant' => 'required|numeric',
            'bureau_repr' => 'required|string|max:100',
            'province' => 'nullable|string|max:100',
            'nombre_declarations' => 'nullable|integer',
            'articles' => 'required|array|min:1',
            'articles.*.designation' => 'required|string|max:255',
            'articles.*.position' => 'required|string|max:50',
            'articles.*.quantite' => 'required|integer|min:1',
            'articles.*.poids' => 'required|numeric|min:0',
            'articles.*.fob' => 'required|numeric|min:0',
        ]);

        $dossierData = $request->except('articles');
        $user = $request->user();
        $dossierData['user_id'] = $user->id;
        $dossierData['status'] = $request->input('status', 'en_attente');

        // Deduct fee from wallet
        $cost = 50.00; // Fixed fee
        
        $transactionCtrl = app(\App\Http\Controllers\TransactionController::class);
        $transaction = $transactionCtrl->chargeDossier($user, $cost, $request->input('id'));

        if (!$transaction) {
            return response()->json(['message' => 'Solde de portefeuille insuffisant ou erreur de paiement.'], 400);
        }

        DB::beginTransaction();

        try {
            $dossier = Dossier::create($dossierData);

            foreach ($request->input('articles') as $articleData) {
                $dossier->articles()->create($articleData);
            }

            // Générer une alerte système pour informer les inspecteurs/chefs
            Alerte::create([
                'target_role' => 'inspecteur',
                'type' => 'entree',
                'title' => 'Nouveau Dossier Créé',
                'message' => "Le dossier {$dossier->id} (Réf: {$dossier->reference}) a été enregistré par " . $request->user()->full_name,
                'reference_id' => $dossier->id,
            ]);

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
        $dossier = Dossier::with(['articles', 'user'])->findOrFail($id);
        return response()->json($dossier);
    }

    /**
     * Mise à jour du dossier (champs simples)
     */
    public function update(Request $request, $id)
    {
        $dossier = Dossier::findOrFail($id);
        
        $request->validate([
            'reference_douane' => 'sometimes|required|string',
            'importateur' => 'sometimes|required|string|max:255',
            'declarant' => 'sometimes|required|string|max:255',
            'vehicule' => 'sometimes|required|string|max:100',
            'plaque' => 'sometimes|required|string|max:50',
            'status' => 'sometimes|required|string',
            'localisation' => 'sometimes|required|string',
        ]);

        $dossier->update($request->all());

        return response()->json($dossier->load('articles'));
    }

    /**
     * Mise à jour du statut d'un dossier (ex: validation douanière)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:en_attente,valide,rejete,apure',
        ]);

        $dossier = Dossier::findOrFail($id);
        $oldStatus = $dossier->status;
        $dossier->status = $request->input('status');
        $dossier->save();

        // Générer une alerte en cas de changement de statut
        Alerte::create([
            'recipient_id' => $dossier->user_id, // Alerter le créateur du dossier
            'type' => 'systeme',
            'title' => 'Statut Dossier Mis à Jour',
            'message' => "Le statut du dossier {$dossier->id} a changé de '{$oldStatus}' à '{$dossier->status}'.",
            'reference_id' => $dossier->id,
        ]);

        return response()->json([
            'message' => 'Statut mis à jour avec succès.',
            'dossier' => $dossier
        ]);
    }

    /**
     * Suppression d'un dossier
     */
    public function destroy($id)
    {
        $dossier = Dossier::findOrFail($id);
        $dossier->delete(); // Les articles seront supprimés en cascade
        return response()->json(['message' => 'Dossier supprimé avec succès.']);
    }
}
