<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Barriere;

class BarrierePolicy
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

    public function view(User $user, Barriere $barriere): bool
    {
        // Chef barrière voit sa barrière
        if ($user->barriere_id === $barriere->id) {
            return true;
        }

        // Typing operator voit sa barrière
        if ($user->barriere_id === $barriere->id) {
            return true;
        }

        // Brigadier barrière voit sa barrière
        if ($user->barriere_id === $barriere->id) {
            return true;
        }

        // Inspecteur de la province voit les barrières de sa province
        if ($user->role === 'inspecteur_chef_bureau' || $user->role === 'inspecteur_chef') {
            return $user->province === $barriere->province;
        }

        // Directeur général voit tout
        if ($user->role === 'directeur_general') {
            return true;
        }

        return false;
    }

    public function viewBalance(User $user, Barriere $barriere): bool
    {
        // Chef barrière, typing operator, chef de province
        return ($user->barriere_id === $barriere->id) ||
               ($user->role === 'directeur_provincial' && $user->province === $barriere->province) ||
               ($user->role === 'directeur_general');
    }

    public function manageDocuments(User $user, Barriere $barriere): bool
    {
        // Chef barrière et typing operator
        return in_array($user->role, ['chef_barriere', 'typing_operator']) &&
               $user->barriere_id === $barriere->id;
    }

    public function recordEntry(User $user, Barriere $barriere): bool
    {
        // Brigadier barrière
        return in_array($user->role, ['brigadier_barriere_entree', 'brigadier_barriere_sortie']) &&
               $user->barriere_id === $barriere->id;
    }
}
