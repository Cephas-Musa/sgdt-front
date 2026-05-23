<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Liste des utilisateurs
     */
    public function index(Request $request)
    {
        // Seul le super_admin ou les directeurs peuvent lister les comptes
        $currentUser = $request->user();
        if (!in_array($currentUser->role, ['super_admin', 'directeur_provincial', 'directeur_general'])) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $users = User::all();
        return response()->json($users);
    }

    /**
     * Création d'un nouvel utilisateur avec retour des identifiants (mot de passe copiable)
     */
    public function store(Request $request)
    {
        $currentUser = $request->user();

        // HIÉRARCHIE STRICTE: Seul super_admin peut créer tous les rôles
        // DG peut créer DP, Inspecteurs, Agent Contrôle, Chefs bureaux
        // DP peut créer Inspecteurs, Agent Contrôle
        // Inspecteur peut créer Secrétaires
        // Chef Bureau Repr peut créer Opérateurs Saisie
        // Chef Barrière peut créer Typing Operators
        // Chef Entrepôt Douane peut créer Agents Pointage
        // Chef Entrepôt Privé peut créer Agents Pointage
        // CB Vérification peut créer Vérificateurs
        $roleHierarchy = [
            'super_admin' => [
                'directeur_general', 'directeur_provincial', 'inspecteur',
                'inspecteur_chef_bureau', 'secretaire_inspecteur',
                'chef_bureau_representation', 'operateur_saisie',
                'chef_barriere', 'typing_operator', 'brigadier_barriere_entree',
                'brigadier_barriere_sortie', 'chef_entrepot_douane', 'chef_entrepot_prive',
                'agent_pointage', 'verificateur', 'chef_verification', 'agent_controle'
            ],
            'directeur_general' => ['directeur_provincial', 'inspecteur', 'inspecteur_chef_bureau', 'agent_controle'],
            'directeur_provincial' => ['inspecteur', 'inspecteur_chef_bureau', 'agent_controle'],
            'inspecteur_chef_bureau' => ['secretaire_inspecteur'],
            'inspecteur' => ['secretaire_inspecteur'],
            'chef_bureau_representation' => ['operateur_saisie'],
            'chef_barriere' => ['typing_operator'],
            'chef_entrepot_douane' => ['agent_pointage'],
            'chef_entrepot_prive' => ['agent_pointage'],
            'chef_verification' => ['verificateur'],
        ];

        $allowedRoles = $roleHierarchy[$currentUser->role] ?? [];

        if ($currentUser->role !== 'super_admin' && !in_array($request->role, $allowedRoles)) {
            return response()->json(['message' => 'Action non autorisée. Votre rôle ne peut pas créer le rôle "' . $request->role . '".'], 403);
        }

        $request->validate([
            'phone_number' => [
                'required',
                'string',
                'unique:users,phone_number',
                'regex:/^\+(256|243)[0-9]{9,12}$/'
            ],
            'role' => 'required|string',
            'full_name' => 'required|string|max:255',
            'bureau' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'matricule' => 'nullable|string|max:50|unique:users,matricule',
        ], [
            'phone_number.regex' => 'Le numéro doit commencer par +256 ou +243 suivi du numéro valide.',
            'phone_number.unique' => 'Ce numéro de téléphone est déjà enregistré.',
            'matricule.unique' => 'Ce matricule est déjà utilisé.'
        ]);

        $tempPassword = $request->input('password') ?: 'SGDT@' . Str::upper(Str::random(4)) . mt_rand(1000, 9999);

        $bureau = $request->bureau;
        $province = $request->province;

        if ($currentUser->role !== 'super_admin' && $currentUser->role !== 'directeur_general') {
            if ($currentUser->province) {
                $province = $currentUser->province;
            }
            if ($currentUser->bureau) {
                $bureau = $currentUser->bureau;
            }
        }

        $user = User::create([
            'phone_number' => $request->phone_number,
            'password' => Hash::make($tempPassword),
            'role' => $request->role,
            'full_name' => $request->full_name,
            'bureau' => $bureau,
            'province' => $province,
            'matricule' => $request->matricule,
            'phone_verified_at' => null,
            'created_by' => $currentUser->id,
            'parent_id' => $currentUser->id,
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès.',
            'user' => $user,
            'credentials' => [
                'phone_number' => $user->phone_number,
                'password' => $tempPassword,
            ]
        ], 201);
    }

    /**
     * Suppression d'un utilisateur
     */
    public function destroy(Request $request, $id)
    {
        $currentUser = $request->user();
        if ($currentUser->role !== 'super_admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $user = User::findOrFail($id);

        if ($user->phone_number === '+243813478556') {
            return response()->json(['message' => 'Impossible de supprimer le Superadmin par défaut.'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }

    /**
     * Mise à jour d'un utilisateur
     */
    public function update(Request $request, $id)
    {
        $currentUser = $request->user();
        if ($currentUser->role !== 'super_admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'full_name' => 'required|string|max:255',
            'role' => 'required|string',
            'bureau' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'matricule' => 'nullable|string|max:50|unique:users,matricule,'.$user->id,
        ]);

        $user->update($request->only(['full_name', 'role', 'bureau', 'province', 'matricule']));

        return response()->json(['message' => 'Utilisateur mis à jour avec succès.', 'user' => $user]);
    }

    /**
     * Bloquer ou débloquer un utilisateur (mise à jour du statut)
     */
    public function updateStatus(Request $request, $id)
    {
        $currentUser = $request->user();
        if ($currentUser->role !== 'super_admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $user = User::findOrFail($id);

        if ($user->phone_number === '+243813478556') {
            return response()->json(['message' => 'Impossible de bloquer le Superadmin.'], 400);
        }

        $request->validate([
            'status' => 'required|in:actif,bloque'
        ]);

        $user->status = $request->status;
        $user->save();

        return response()->json(['message' => 'Statut mis à jour avec succès.', 'user' => $user]);
    }
}
