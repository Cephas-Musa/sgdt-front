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
     * La logique fine est gérée par DossierAccessService ; ici on est permissif.
     */
    public function view(User $user, Dossier $dossier): bool
    {
        if (in_array($user->role, ['super_admin', 'directeur', 'directeur_provincial'])) {
            return true;
        }

        // Inspecteur chef, agent controle, secrétaire, chef bureau repr => même bureau
        if (in_array($user->role, ['inspecteur_chef', 'inspecteur', 'agent_controle', 'secretaire_inspecteur', 'chef_bureau_repr'])) {
            return $dossier->bureau_id === $user->bureau_id
                || $dossier->created_by === $user->id
                || $dossier->inspecteur_id === $user->id;
        }

        // Opérateur saisie voit ses propres dossiers
        if ($user->role === 'operateur_saisie') {
            return $dossier->created_by === $user->id
                || ($dossier->bureau_id === $user->bureau_id);
        }

        // Créateur voit toujours son dossier
        if ($dossier->created_by === $user->id) {
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
            'super_admin',
            'inspecteur_chef',
            'inspecteur',
            'secretaire_inspecteur',
            'operateur_saisie',
            'chef_bureau_repr',
        ]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Dossier $dossier): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        // Créateur peut modifier si pas encore appuré
        if ($dossier->created_by === $user->id && $dossier->status !== 'appure') {
            return true;
        }

        // Inspecteur chef peut modifier les dossiers de son bureau
        if (in_array($user->role, ['inspecteur_chef', 'inspecteur', 'secretaire_inspecteur'])) {
            return $dossier->inspecteur_id === $user->id
                || $dossier->bureau_id === $user->bureau_id;
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

        // Créateur peut supprimer si pas encore appuré
        if ($dossier->created_by === $user->id && in_array($dossier->status, ['brouillon', 'en_cours'])) {
            return true;
        }

        return false;
    }

    /**
     * Déterminer si l'utilisateur peut valider un dossier.
     */
    public function validate(User $user, Dossier $dossier): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        if (in_array($user->role, ['inspecteur_chef', 'inspecteur'])) {
            return $dossier->inspecteur_id === $user->id
                || $dossier->bureau_id === $user->bureau_id;
        }

        return false;
    }

    /**
     * Déterminer si l'utilisateur peut appurer un dossier.
     */
    public function appure(User $user, Dossier $dossier): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        if (in_array($user->role, ['inspecteur_chef', 'inspecteur', 'verificateur', 'cb_verification'])) {
            return $dossier->bureau_id === $user->bureau_id
                || $dossier->inspecteur_id === $user->id
                || $dossier->created_by === $user->id;
        }

        return false;
    }
}
