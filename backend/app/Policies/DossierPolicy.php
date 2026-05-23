<?php

namespace App\Policies;

use App\Models\Dossier;
use App\Models\User;

class DossierPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Dossier $dossier): bool
    {
        // Super admin voit tout
        if ($user->role === 'super_admin') {
            return true;
        }

        // Directeur général voit tous les dossiers
        if ($user->role === 'directeur_general') {
            return true;
        }

        // Directeur provincial voit dossiers de sa province
        if ($user->role === 'directeur_provincial') {
            return $user->province_id &&
                   ($dossier->province === $user->province || $dossier->localisation === $user->province);
        }

        // Inspecteur, Chef Bureau, Agent Contrôle, Secrétaire voient les dossiers de leur bureau
        if (in_array($user->role, ['inspecteur_chef_bureau', 'inspecteur', 'agent_controle', 'secretaire_inspecteur', 'chef_bureau_representation'])) {
            return $user->bureau_id && $dossier->bureau_repr === $user->bureau;
        }

        // Opérateur Saisie voit ses dossiers et ceux du bureau
        if ($user->role === 'operateur_saisie') {
            return $user->bureau_representation_id === $dossier->bureau_repr || $user->id === $dossier->user_id;
        }

        // Créateur voit son dossier
        if ($dossier->user_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, [
            'declarant', 'importateur', 'super_admin', 'secretaire_inspecteur',
            'operateur_saisie', 'chef_bureau_representation'
        ]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Dossier $dossier): bool
    {
        // Super admin peut modifier
        if ($user->role === 'super_admin') {
            return true;
        }

        // Créateur peut modifier si en brouillon
        if ($dossier->user_id === $user->id && $dossier->status === 'brouillon') {
            return true;
        }

        // Directeur provincial de sa province
        if ($user->role === 'directeur_provincial') {
            return $user->province_id &&
                   ($dossier->province === $user->province || $dossier->localisation === $user->province);
        }

        // Inspecteur, Chef Bureau, Secrétaire de leur bureau
        if (in_array($user->role, ['inspecteur_chef_bureau', 'inspecteur', 'secretaire_inspecteur', 'chef_bureau_representation'])) {
            return $user->bureau_id && $dossier->bureau_repr === $user->bureau;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Dossier $dossier): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        // Créateur peut supprimer s'il n'est pas payé
        if ($dossier->user_id === $user->id && $dossier->status === 'brouillon') {
            return true;
        }

        return false;
    }

    /**
     * Déterminer si l'utilisateur peut valider un dossier
     */
    public function validate(User $user, Dossier $dossier): bool
    {
        // Super admin
        if ($user->role === 'super_admin') {
            return true;
        }

        // Inspecteur chef bureau peut valider dossiers de son bureau
        if ($user->role === 'inspecteur_chef_bureau') {
            return $user->bureau_id && $dossier->bureau_repr === $user->bureau;
        }

        return false;
    }

    /**
     * Déterminer si l'utilisateur peut appurer un dossier
     */
    public function appure(User $user, Dossier $dossier): bool
    {
        // Super admin
        if ($user->role === 'super_admin') {
            return true;
        }

        // Inspecteur chef bureau et verificateur
        if (in_array($user->role, ['inspecteur_chef_bureau', 'verificateur', 'chef_verification'])) {
            return $user->bureau_id && $dossier->bureau_repr === $user->bureau;
        }

        return false;
    }
}
        }

        if ($dossier->user_id === $user->id && $dossier->status === 'en_attente') {
            return true;
        }

        return false;
    }
}
