<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Alerte;

class AlertePolicy
{
    /**
     * Super admin voit toutes les alertes
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

    public function view(User $user, Alerte $alerte): bool
    {
        // Destinataire ou rôle ciblé peut voir
        if ($alerte->recipient_id === $user->id || $alerte->target_role === $user->role) {
            return true;
        }

        // Superviseur peut voir alertes de ses subordonnés
        $subordinateIds = collect($user->getAllSubordinates())->pluck('id')->toArray();
        if (in_array($alerte->user_id ?? null, $subordinateIds)) {
            return true;
        }

        return false;
    }

    public function create(User $user): bool
    {
        // Alertes créées automatiquement, pas d'action user directe
        return false;
    }

    public function markAsRead(User $user, Alerte $alerte): bool
    {
        return $alerte->recipient_id === $user->id || $alerte->target_role === $user->role;
    }

    public function delete(User $user, Alerte $alerte): bool
    {
        // Seul le super admin peut supprimer des alertes
        return $user->role === 'super_admin';
    }
}
