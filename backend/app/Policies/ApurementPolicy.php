<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Apurement;

class ApurementPolicy
{
    /**
     * Super admin peut tout faire
     */
    public function before(User $user, string $ability): bool|null
    {
        if ($user->role === 'super_admin') {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Apurement $apurement): bool
    {
        // Créateur voit son appurement
        if ($apurement->user_id === $user->id) {
            return true;
        }

        // Inspecteur, Chef Bureau voient les apurements de leur bureau
        if (in_array($user->role, ['inspecteur_chef_bureau', 'inspecteur_chef', 'verificateur', 'chef_verification'])) {
            return $user->bureau_id === $apurement->dossier?->bureau_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['inspecteur_chef_bureau', 'inspecteur_chef', 'verificateur', 'secretaire_inspecteur']);
    }

    public function update(User $user, Apurement $apurement): bool
    {
        // Créateur peut modifier
        if ($apurement->user_id === $user->id) {
            return true;
        }

        // Inspecteur chef bureau de son bureau
        if ($user->role === 'inspecteur_chef_bureau') {
            return $user->bureau_id === $apurement->dossier?->bureau_id;
        }

        return false;
    }

    public function delete(User $user, Apurement $apurement): bool
    {
        return $apurement->user_id === $user->id || $user->role === 'super_admin';
    }

    public function approve(User $user, Apurement $apurement): bool
    {
        return in_array($user->role, ['inspecteur_chef_bureau', 'chef_verification', 'verificateur']);
    }
}
