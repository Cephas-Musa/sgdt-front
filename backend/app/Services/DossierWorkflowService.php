<?php

namespace App\Services;

use App\Models\Dossier;
use App\Models\DossierWorkflow;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use App\Enums\DossierStatus;

class DossierWorkflowService
{
    /**
     * Transitionne un dossier d'un statut à un autre.
     */
    public function transition(Dossier $dossier, DossierStatus $newStatus, int $userId, ?string $commentaire = null): Dossier
    {
        return DB::transaction(function () use ($dossier, $newStatus, $userId, $commentaire) {
            
            // Verrouillage pessimiste pour éviter les conditions de course
            $lockedDossier = Dossier::where('id', $dossier->id)->lockForUpdate()->first();

            $oldStatus = $lockedDossier->status;

            // Vérifier si la transition est valide (State Machine Logic)
            if (!$this->isValidTransition($oldStatus, $newStatus)) {
                throw new \Exception("Transition invalide de {$oldStatus->value} vers {$newStatus->value}");
            }

            // Mettre à jour le statut
            $lockedDossier->status = $newStatus;
            $lockedDossier->save();

            // Historiser le workflow
            DossierWorkflow::create([
                'dossier_id' => $lockedDossier->id,
                'from_status' => $oldStatus->value,
                'to_status' => $newStatus->value,
                'changed_by' => $userId,
                'commentaire' => $commentaire,
            ]);

            // Logger dans AuditLog (Global Audit)
            AuditLog::create([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'user_id' => $userId,
                'action' => 'status_change',
                'module' => 'dossier',
                'target_id' => $lockedDossier->id,
                'old_data' => ['status' => $oldStatus->value],
                'new_data' => ['status' => $newStatus->value],
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'device' => request()->header('User-Agent') ?? 'System',
            ]);

            return $lockedDossier;
        });
    }

    /**
     * Définit les règles de transition autorisées.
     */
    protected function isValidTransition(DossierStatus $from, DossierStatus $to): bool
    {
        $allowedTransitions = [
            DossierStatus::BROUILLON->value => [DossierStatus::ATTENTE_PAIEMENT->value],
            DossierStatus::ATTENTE_PAIEMENT->value => [DossierStatus::PAYE->value],
            DossierStatus::PAYE->value => [DossierStatus::VALIDATION_INSPECTEUR->value],
            DossierStatus::VALIDATION_INSPECTEUR->value => [DossierStatus::EN_COURS->value, DossierStatus::BROUILLON->value],
            DossierStatus::EN_COURS->value => [DossierStatus::CONTROLE->value, DossierStatus::VERIFICATION->value, DossierStatus::APPUREMENT_ADMINISTRATIF->value],
            DossierStatus::CONTROLE->value => [DossierStatus::VERIFICATION->value, DossierStatus::APPUREMENT_ADMINISTRATIF->value],
            DossierStatus::VERIFICATION->value => [DossierStatus::APPUREMENT_ADMINISTRATIF->value],
            DossierStatus::APPUREMENT_ADMINISTRATIF->value => [DossierStatus::APPUREMENT_FINAL->value],
            DossierStatus::APPUREMENT_FINAL->value => [DossierStatus::TERMINE->value],
            DossierStatus::TERMINE->value => [], // État final
        ];

        $allowedNextStatuses = $allowedTransitions[$from->value] ?? [];

        return in_array($to->value, $allowedNextStatuses);
    }
}
