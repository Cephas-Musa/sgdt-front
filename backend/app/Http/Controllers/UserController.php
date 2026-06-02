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
     * Hiérarchie stricte : correspond exactement au fichier hierarchy.ts du frontend.
     * Chaque clé = rôle créateur, valeur = liste des rôles qu'il peut créer.
     */
    private array $roleHierarchy = [
        'super_admin' => [
            'directeur',
            'directeur_provincial',
            'inspecteur_chef',
            'agent_controle',
            'chef_bureau_repr',
            'operateur_saisie',
            'chef_barriere',
            'typing_operator',
            'brigadier_barriere',
            'secretaire_inspecteur',
            'verificateur',
            'cb_verification',
            'chef_recherche',
            'chef_manifest',
            'agent_empty_manifest',
            'percepteur',
            'chef_entrepot_log',
            'chef_entrepot_douane',
            'brigadier_entrepot',
            'agent_pointage',
            'barriere_controle',
            'manager_entrepot',
            'partenaire',
        ],
        'directeur'            => ['directeur_provincial', 'inspecteur_chef'],
        'directeur_provincial' => ['inspecteur_chef', 'agent_controle', 'chef_bureau_repr', 'chef_barriere'],
        'inspecteur_chef'      => [
            'secretaire_inspecteur',
            'verificateur',
            'cb_verification',
            'chef_recherche',
            'chef_manifest',
            'chef_entrepot_log',
            'chef_entrepot_douane',
            'chef_barriere',
            'chef_bureau_repr',
            'barriere_controle',
            'manager_entrepot',
        ],
        'chef_bureau_repr'    => ['operateur_saisie'],
        'chef_barriere'       => ['typing_operator', 'brigadier_barriere'],
        'chef_manifest'       => ['agent_empty_manifest', 'percepteur'],
        'chef_entrepot_log'   => ['brigadier_entrepot', 'agent_pointage'],
        'chef_entrepot_douane'=> ['brigadier_entrepot', 'agent_pointage'],
        'cb_verification'     => ['verificateur'],
        'secretaire_inspecteur' => [],
    ];

    private function getCreatableRoles(string $role): array
    {
        return $this->roleHierarchy[$role] ?? [];
    }

    /**
     * Liste des utilisateurs — accessible à tout rôle pouvant gérer des comptes.
     */
    public function index(Request $request)
    {
        $currentUser = $request->user();
        $creatable   = $this->getCreatableRoles($currentUser->role);

        // Super admin voit tout sans restriction
        if ($currentUser->role === 'super_admin') {
            return response()->json(User::all());
        }

        // Si le rôle ne peut créer personne, accès interdit
        if (empty($creatable)) {
            return response()->json(['message' => 'Non autorisé à consulter les comptes.'], 403);
        }

        // On renvoie tous les utilisateurs ; le frontend filtre selon la hiérarchie
        return response()->json(User::all());
    }

    /**
     * Création d'un nouvel utilisateur avec retour des identifiants (mot de passe lisible).
     */
    public function store(Request $request)
    {
        $currentUser  = $request->user();
        $creatable    = $this->getCreatableRoles($currentUser->role);
        $roleToCreate = $request->input('role');

        // Vérification hiérarchie
        if ($currentUser->role !== 'super_admin' && !in_array($roleToCreate, $creatable)) {
            return response()->json([
                'message' => "Votre rôle ({$currentUser->role}) n'est pas autorisé à créer un compte «{$roleToCreate}»."
            ], 403);
        }

        $request->validate([
            'phone_number' => [
                'required',
                'string',
                'unique:users,phone_number',
                'regex:/^\+(256|243)[0-9]{9,12}$/'
            ],
            'role'       => 'required|string',
            'full_name'  => 'required|string|max:255',
            'bureau'     => 'nullable|string|max:100',
            'province'   => 'nullable|string|max:100',
            'matricule'  => 'nullable|string|max:50|unique:users,matricule',
            'barriere_id'=> 'nullable|string|exists:barrieres,id',
        ], [
            'phone_number.regex'  => 'Le numéro doit commencer par +256 ou +243 suivi de 9 à 12 chiffres.',
            'phone_number.unique' => 'Ce numéro de téléphone est déjà enregistré.',
            'matricule.unique'    => 'Ce matricule est déjà utilisé.',
        ]);

        $tempPassword = $request->input('password')
            ?: 'SGDT@' . Str::upper(Str::random(4)) . mt_rand(1000, 9999);

        $bureau   = $request->bureau;
        $province = $request->province;

        // Résoudre bureau_id à partir du nom du bureau
        $bureauId = null;
        if ($bureau) {
            $bureauModel = \App\Models\BureauDouanier::where('denomination', $bureau)->first();
            $bureauId = $bureauModel?->id;
        }

        $user = User::create([
            'phone_number'     => $request->phone_number,
            'password'         => Hash::make($tempPassword),
            'role'             => $roleToCreate,
            'full_name'        => $request->full_name,
            'bureau'           => $bureau,
            'bureau_id'        => $bureauId,
            'province'         => $province,
            'matricule'        => $request->matricule,
            'phone_verified_at'=> null,
            'created_by'       => $currentUser->id,
            'parent_id'        => $currentUser->id,
            'barriere_id'      => $request->barriere_id,
        ]);

        return response()->json([
            'message'     => 'Utilisateur créé avec succès.',
            'user'        => $user,
            'credentials' => [
                'phone_number' => $user->phone_number,
                'password'     => $tempPassword,
            ],
        ], 201);
    }

    /**
     * Suppression d'un utilisateur.
     */
    public function destroy(Request $request, $id)
    {
        $currentUser  = $request->user();
        $userToDelete = User::findOrFail($id);

        // Protéger le super-admin par défaut
        if ($userToDelete->phone_number === '+243813478556') {
            return response()->json(['message' => 'Impossible de supprimer le Superadmin par défaut.'], 400);
        }

        // Vérification hiérarchie
        $creatable = $this->getCreatableRoles($currentUser->role);
        if ($currentUser->role !== 'super_admin' && !in_array($userToDelete->role, $creatable)) {
            return response()->json(['message' => 'Non autorisé à supprimer cet utilisateur.'], 403);
        }

        $userToDelete->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }

    /**
     * Mise à jour d'un utilisateur.
     */
    public function update(Request $request, $id)
    {
        $currentUser  = $request->user();
        $userToUpdate = User::findOrFail($id);

        // On peut toujours modifier son propre profil
        if ($currentUser->id !== $userToUpdate->id) {
            $creatable = $this->getCreatableRoles($currentUser->role);
            if ($currentUser->role !== 'super_admin' && !in_array($userToUpdate->role, $creatable)) {
                return response()->json(['message' => 'Non autorisé à modifier cet utilisateur.'], 403);
            }
        }

        $request->validate([
            'full_name' => 'required|string|max:255',
            'role'      => 'required|string',
            'bureau'    => 'nullable|string|max:100',
            'province'  => 'nullable|string|max:100',
            'matricule' => 'nullable|string|max:50|unique:users,matricule,' . $userToUpdate->id,
        ]);

        $userToUpdate->update($request->only(['full_name', 'role', 'bureau', 'province', 'matricule']));

        return response()->json(['message' => 'Utilisateur mis à jour avec succès.', 'user' => $userToUpdate]);
    }

    /**
     * Bloquer ou débloquer un utilisateur.
     */
    public function updateStatus(Request $request, $id)
    {
        $currentUser = $request->user();
        $creatable   = $this->getCreatableRoles($currentUser->role);

        $user = User::findOrFail($id);

        if ($user->phone_number === '+243813478556') {
            return response()->json(['message' => 'Impossible de bloquer le Superadmin.'], 400);
        }

        if ($currentUser->role !== 'super_admin' && !in_array($user->role, $creatable)) {
            return response()->json(['message' => 'Non autorisé à modifier le statut de cet utilisateur.'], 403);
        }

        $request->validate(['status' => 'required|in:actif,bloque']);

        $user->status = $request->status;
        $user->save();

        return response()->json(['message' => 'Statut mis à jour avec succès.', 'user' => $user]);
    }

    /**
     * Recharge du portefeuille d'un utilisateur (réservé au super admin).
     */
    public function topupWallet(Request $request, $id)
    {
        $currentUser = $request->user();
        if ($currentUser->role !== 'super_admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $request->validate(['amount' => 'required|numeric|min:1']);

        $user = User::findOrFail($id);
        $user->wallet_balance = floatval($user->wallet_balance) + floatval($request->amount);
        $user->save();

        \App\Models\Transaction::create([
            'reference'   => 'TRX-' . strtoupper(Str::random(8)),
            'user_id'     => $user->id,
            'type'        => 'credit',
            'amount'      => $request->amount,
            'description' => 'Recharge effectuée par le Super Admin',
            'status'      => 'completed',
        ]);

        return response()->json([
            'message'     => 'Solde rechargé avec succès.',
            'new_balance' => $user->wallet_balance,
        ]);
    }
}
