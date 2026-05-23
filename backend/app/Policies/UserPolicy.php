<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'directeur', 'directeur_provincial', 'chef_bureau', 'inspecteur_chef']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        if ($user->id === $model->id) {
            return true;
        }

        if ($model->parent_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, string $roleToCreate = null): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        if (!$roleToCreate) {
            return in_array($user->role, ['directeur', 'directeur_provincial', 'inspecteur_chef', 'inspecteur', 'chef_bureau']);
        }

        switch ($user->role) {
            case 'directeur':
                return in_array($roleToCreate, ['directeur_provincial']);
            case 'directeur_provincial':
                return in_array($roleToCreate, ['chef_bureau', 'inspecteur_chef', 'inspecteur']);
            case 'chef_bureau':
                return in_array($roleToCreate, ['agent_controle']);
            case 'inspecteur_chef':
            case 'inspecteur':
                return in_array($roleToCreate, ['secretaire_inspecteur']);
            default:
                return false;
        }
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->role === 'super_admin' || $model->parent_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->role === 'super_admin' || $model->parent_id === $user->id;
    }
}
