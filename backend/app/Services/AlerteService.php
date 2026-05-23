<?php

namespace App\Services;

use App\Models\Alerte;
use App\Models\User;

class AlerteService
{
    /**
     * Create a hierarchical alert that escalates through the chain
     *
     * @param string $dossierId
     * @param string $type
     * @param string $title
     * @param string $message
     * @param int $triggerUserId
     * @return array Array of created alerts
     */
    public function createHierarchicalAlert(string $dossierId, string $type, string $title, string $message, int $triggerUserId): array
    {
        $triggerUser = User::find($triggerUserId);
        if (!$triggerUser) {
            return [];
        }

        $alerts = [];
        $hierarchy = $triggerUser->getHierarchyChain();
        $levelCounter = 0;

        // Créer une alerte pour chaque niveau de la hiérarchie
        foreach ($hierarchy as $level => $user) {
            if ($level === 0) continue; // Skip le trigger user lui-même

            $alert = Alerte::create([
                'recipient_id' => $user->id,
                'dossier_id' => $dossierId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'hierarchy_level' => $levelCounter,
                'target_role' => $user->role,
                'is_read' => false,
                'triggered_by' => $triggerUserId,
            ]);

            $alerts[] = $alert;
            $levelCounter++;

            // Envoyer notification en temps réel
            $this->notifyUser($user, $alert);
        }

        return $alerts;
    }

    /**
     * Create an alert for specific roles
     */
    public function createRoleAlert(string $dossierId, string $type, string $title, string $message, array $roles): array
    {
        $users = User::whereIn('role', $roles)->get();
        $alerts = [];

        foreach ($users as $user) {
            $alert = Alerte::create([
                'recipient_id' => $user->id,
                'dossier_id' => $dossierId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'hierarchy_level' => 0,
                'target_role' => $user->role,
                'is_read' => false,
            ]);

            $alerts[] = $alert;
            $this->notifyUser($user, $alert);
        }

        return $alerts;
    }

    /**
     * Create immediate supervisor alert
     */
    public function createSupervisorAlert(string $dossierId, string $type, string $title, string $message, int $userId): ?Alerte
    {
        $user = User::find($userId);
        if (!$user || !$user->parent_id) {
            return null;
        }

        $supervisor = User::find($user->parent_id);
        if (!$supervisor) {
            return null;
        }

        $alert = Alerte::create([
            'recipient_id' => $supervisor->id,
            'dossier_id' => $dossierId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'hierarchy_level' => 1,
            'target_role' => $supervisor->role,
            'is_read' => false,
        ]);

        $this->notifyUser($supervisor, $alert);

        return $alert;
    }

    /**
     * Types of alert validation
     */
    public function validateDossierStatus(string $dossierId, string $fromStatus, string $toStatus): array
    {
        $alerts = [];

        // Validation: Un dossier ne peut PAS être validé sans paiement
        if ($toStatus === 'valide' && $fromStatus !== 'paye') {
            $alerts[] = [
                'type' => 'dossier_bloque',
                'message' => 'Impossible de valider un dossier non payé.',
            ];
        }

        // Validation: Un dossier ne peut PAS être appuré sans vérification
        if ($toStatus === 'appure' && $fromStatus !== 'verification') {
            $alerts[] = [
                'type' => 'dossier_bloque',
                'message' => 'Impossible d\'appurer un dossier non vérifié.',
            ];
        }

        // Validation: Un dossier ne peut PAS être clôturé sans sortie validée
        if ($toStatus === 'termine' && !$this->hasValidExit($dossierId)) {
            $alerts[] = [
                'type' => 'dossier_bloque',
                'message' => 'Impossible de terminer un dossier sans sortie validée.',
            ];
        }

        return $alerts;
    }

    /**
     * Check warehouse alerts
     */
    public function checkWarehouseAlerts(string $entrepotId): array
    {
        $alerts = [];

        $entrepot = \App\Models\Entrepot::find($entrepotId);
        if (!$entrepot) {
            return [];
        }

        // Vérifier surcharge entrepôt
        $totalWeight = \App\Models\MouvementStockage::where('entrepot_id', $entrepotId)
            ->whereIn('type_mouvement', ['entree', 'transbordement'])
            ->sum('poids');

        if ($totalWeight > $entrepot->capacite * 0.9) {
            $alerts[] = [
                'type' => 'surcharge_entrepot',
                'message' => 'L\'entrepôt est à ' . round(($totalWeight / $entrepot->capacite) * 100, 1) . '% de sa capacité.',
                'severity' => 'warning',
            ];
        }

        if ($totalWeight > $entrepot->capacite) {
            $alerts[] = [
                'type' => 'surcharge_entrepot',
                'message' => 'L\'entrepôt dépasse sa capacité!',
                'severity' => 'critical',
            ];
        }

        return $alerts;
    }

    /**
     * Check payment alerts
     */
    public function checkPaymentAlerts(string $dossierId): array
    {
        $alerts = [];
        $dossier = \App\Models\Dossier::find($dossierId);

        if (!$dossier) {
            return [];
        }

        // Vérifier paiement manquant
        $payment = \App\Models\Transaction::where('dossier_id', $dossierId)
            ->where('status', 'completed')
            ->first();

        if (!$payment && $dossier->status !== 'brouillon') {
            $alerts[] = [
                'type' => 'paiement_manquant',
                'message' => 'Aucun paiement enregistré pour ce dossier.',
                'severity' => 'high',
            ];
        }

        return $alerts;
    }

    /**
     * Check DRA/T1 consistency
     */
    public function checkDRAT1Consistency(string $dossierId): array
    {
        $alerts = [];
        $dossier = \App\Models\Dossier::find($dossierId);

        if (!$dossier) {
            return [];
        }

        // Vérifier que DRA et T1 existent
        if (!$dossier->dra || !$dossier->t1) {
            $alerts[] = [
                'type' => 'incohérence_dra_t1',
                'message' => 'DRA ou T1 manquants dans le dossier.',
                'severity' => 'high',
            ];
        }

        // Vérifier les articles
        $articleCount = \App\Models\Article::where('dossier_id', $dossierId)->count();
        if ($articleCount === 0) {
            $alerts[] = [
                'type' => 'incohérence_dra_t1',
                'message' => 'Aucun article défini pour ce dossier.',
                'severity' => 'high',
            ];
        }

        return $alerts;
    }

    /**
     * Check delayed clearances
     */
    public function checkDelayedClearances(): array
    {
        $alerts = [];

        $delayed = \App\Models\Apurement::where('status', '!=', 'termine')
            ->where('created_at', '<', now()->subDays(7))
            ->get();

        foreach ($delayed as $apurement) {
            $alerts[] = [
                'type' => 'retard_appurement',
                'dossier_id' => $apurement->dossier_id,
                'message' => 'Appurement retardé: ' . $apurement->dossier_id,
                'severity' => 'warning',
            ];
        }

        return $alerts;
    }

    /**
     * Send real-time notification to user
     */
    private function notifyUser(User $user, Alerte $alert): void
    {
        // À implémenter avec WebSocket/Broadcasting
        // Pour l'instant, c'est un placeholder
        // Dans une implémentation réelle:
        // - Broadcast::on('user.' . $user->id)->dispatch(new AlertNotification($alert));
        // - Ou envoyer un SMS/Email via la notificationService
    }

    /**
     * Check if dossier has valid exit
     */
    private function hasValidExit(string $dossierId): bool
    {
        return \App\Models\Mouvement::where('dossier_id', $dossierId)
            ->where('operation_type', 'sortie')
            ->whereIn('sub_type_operation', ['validee', 'autorisee'])
            ->exists();
    }
}

