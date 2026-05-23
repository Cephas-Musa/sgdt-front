<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Entrepot;

class EntrepotPolicy
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

    public function view(User $user, Entrepot $entrepot): bool
    {
        // Chef entrepôt voit son entrepôt
        if ($user->entrepot_id === $entrepot->id) {
            return true;
        }

        // Agent pointage voit l'entrepôt où il travaille
        if ($user->entrepot_id === $entrepot->id) {
            return true;
        }

        // Inspecteur peut voir les entrepôts de son bureau
        if (in_array($user->role, ['inspecteur_chef_bureau', 'inspecteur'])) {
            return $user->bureau_id === $entrepot->bureau;
        }

        return false;
    }

    public function create(User $user): bool
    {
        // Seul super admin peut créer entrepôts
        return false;
    }

    public function update(User $user, Entrepot $entrepot): bool
    {
        // Chef entrepôt peut modifier son entrepôt
        if ($user->role === 'chef_entrepot_douane' || $user->role === 'chef_entrepot_prive') {
            return $user->entrepot_id === $entrepot->id;
        }

        return false;
    }

    public function manageDenumbrement(User $user, Entrepot $entrepot): bool
    {
        // Chef entrepôt double (douane/privé)
        return in_array($user->role, ['chef_entrepot_douane', 'chef_entrepot_prive']) &&
               $user->entrepot_id === $entrepot->id;
    }

    public function authorizeDecharge(User $user, Entrepot $entrepot): bool
    {
        return ($user->role === 'chef_entrepot_douane' || $user->role === 'chef_entrepot_prive') &&
               $user->entrepot_id === $entrepot->id;
    }
}
