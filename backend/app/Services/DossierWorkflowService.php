<?php

namespace App\Services;

use App\Models\Dossier;
use Illuminate\Validation\ValidationException;

class DossierWorkflowService
{
    /**
     * Valid transitions.
     * The dossier is created directly as 'paye'.
     *
     * @var array<string, string>
     */
    protected array $transitions = [
        'paye' => 'valide',
        'valide' => 'en_cours',
        'en_cours' => 'verification',
        'verification' => 'apure',
        'apure' => 'termine',
    ];

    /**
     * Transition a dossier to the next status.
     *
     * @param Dossier $dossier
     * @param string $newStatus
     * @return Dossier
     * @throws ValidationException
     */
    public function transition(Dossier $dossier, string $newStatus): Dossier
    {
        $currentStatus = $dossier->status;

        // Check if the transition is allowed based on the workflow rules
        if (!isset($this->transitions[$currentStatus]) || $this->transitions[$currentStatus] !== $newStatus) {
            throw ValidationException::withMessages([
                'status' => ["Invalid status transition from '{$currentStatus}' to '{$newStatus}'."],
            ]);
        }

        // Apply the transition
        $dossier->status = $newStatus;
        $dossier->save();

        return $dossier;
    }
}
