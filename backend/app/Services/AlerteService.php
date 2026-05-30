<?php

namespace App\Services;

use App\Models\Alerte;
use App\Models\User;
use App\Models\Dossier;
use App\Models\RepresentationEntry;
use App\Models\TypingDocDirect;
use App\Models\ItEntry;
use Illuminate\Support\Facades\Log;

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

    /**
     * Déclenche une alerte suite à une anomalie signalée
     */
    public static function triggerAnomalyAlert(\App\Models\Dossier $dossier, \App\Models\DossierAnomaly $anomaly, User $author)
    {
        $service = new self();
        
        $title = 'Anomalie Détectée: ' . $anomaly->type;
        $message = "Sévérité: {$anomaly->severity->value}. " . $anomaly->description;
        
        // Alerte à l'inspecteur responsable (Role alert ou Hierarchical alert)
        // Dans ce contexte, on veut alerter l'inspecteur du dossier.
        if ($dossier->inspecteur_id) {
            $inspecteur = User::find($dossier->inspecteur_id);
            if ($inspecteur) {
                $alert = Alerte::create([
                    'recipient_id' => $inspecteur->id,
                    'dossier_id' => $dossier->id,
                    'type' => 'anomalie',
                    'title' => $title,
                    'message' => $message,
                    'hierarchy_level' => 1,
                    'target_role' => $inspecteur->role,
                    'is_read' => false,
                    'triggered_by' => $author->id,
                ]);
                $service->notifyUser($inspecteur, $alert);
            }
        }

        // Si c'est critique (high), on prévient aussi le DP
        if ($anomaly->severity->value === 'high' && $dossier->province_id) {
            $service->createRoleAlert($dossier->id, 'anomalie_critique', $title, $message, ['directeur_provincial']);
        }
    }

    // ─── REPRESENTATION & BARRIERE CONSISTENCY ALERTS ───────────────────────

    /**
     * Vérifie la cohérence des poids entre les articles de représentation et les articles du dossier.
     */
    public function checkWeightConsistency(string $dossierId): array
    {
        $alerts = [];
        $dossier = Dossier::find($dossierId);
        if (!$dossier) return $alerts;

        $repEntry = RepresentationEntry::where('dossier_id', $dossierId)->with('articles')->first();
        if (!$repEntry || $repEntry->articles->isEmpty()) return $alerts;

        $repPoids = $repEntry->articles->sum('poids');
        $dossierPoids = $dossier->poids ?? 0;

        if ($dossierPoids > 0 && $repPoids > 0) {
            $diff = abs($repPoids - $dossierPoids);
            $pct = ($diff / max($repPoids, $dossierPoids)) * 100;
            if ($pct > 20) {
                $alerts[] = [
                    'type' => 'incoherence_poids',
                    'message' => "Différence de poids détectée: Représentation={$repPoids}kg, Dossier={$dossierPoids}kg (Écart: " . round($pct, 1) . "%)",
                    'severity' => 'high',
                ];
            }
        }

        return $alerts;
    }

    /**
     * Vérifie si un conteneur est présent dans la représentation mais absent dans les docs barrière.
     */
    public function checkContainerConsistency(string $dossierId): array
    {
        $alerts = [];
        $repEntry = RepresentationEntry::where('dossier_id', $dossierId)->first();
        if (!$repEntry) return $alerts;

        $hasContainer = !empty($repEntry->numero_conteneur) || ($repEntry->container_20 + $repEntry->container_40) > 0;
        if (!$hasContainer) return $alerts;

        $typingDocs = TypingDocDirect::where('dossier_id', $dossierId)->get();
        $hasContainerInDocs = $typingDocs->contains(fn($d) => !empty($d->container_number));

        if (!$hasContainerInDocs) {
            $alerts[] = [
                'type' => 'conteneur_absent_barriere',
                'message' => "Conteneur(s) déclaré(s) en représentation ({$repEntry->container_20}x20 + {$repEntry->container_40}x40) mais aucun conteneur dans les documents barrière.",
                'severity' => 'medium',
            ];
        }

        return $alerts;
    }

    /**
     * Vérifie les contradictions entre les documents (DRA/T1 différents entre modules).
     */
    public function checkDocumentContradictions(string $dossierId): array
    {
        $alerts = [];
        $dossier = Dossier::find($dossierId);
        if (!$dossier) return $alerts;

        $repEntry = RepresentationEntry::where('dossier_id', $dossierId)->first();
        $typingDocs = TypingDocDirect::where('dossier_id', $dossierId)->get();

        if ($repEntry && $typingDocs->isNotEmpty()) {
            $repT1 = $repEntry->t1_reference;
            foreach ($typingDocs as $doc) {
                if (!empty($repT1) && !empty($doc->t1_reference) && $repT1 !== $doc->t1_reference) {
                    $alerts[] = [
                        'type' => 'contradiction_t1',
                        'message' => "Référence T1 différente: Représentation='{$repT1}', Document direct barrière='{$doc->t1_reference}'.",
                        'severity' => 'high',
                    ];
                }
            }
        }

        return $alerts;
    }

    /**
     * Détecte les doublons potentiels (même plaque/châssis dans différents dossiers).
     */
    public function checkDuplicates(string $vehiculeReference, ?string $excludeDossierId = null): array
    {
        $alerts = [];
        if (empty($vehiculeReference)) return $alerts;

        $existingDocs = TypingDocDirect::where('vehicule_reference', $vehiculeReference)
            ->when($excludeDossierId, fn($q) => $q->where('dossier_id', '!=', $excludeDossierId))
            ->whereNotNull('dossier_id')
            ->with('dossier')
            ->get();

        foreach ($existingDocs as $doc) {
            $alerts[] = [
                'type' => 'doublon_vehicule',
                'message' => "Véhicule {$vehiculeReference} déjà enregistré sur le dossier {$doc->dossier?->reference}.",
                'severity' => 'medium',
            ];
        }

        return $alerts;
    }

    /**
     * Vérifie les incohérences entre les données de représentation et les IT entries.
     */
    public function checkRepresentationVsItEntries(string $dossierId): array
    {
        $alerts = [];
        $repEntry = RepresentationEntry::where('dossier_id', $dossierId)->first();
        $itEntries = ItEntry::where('dossier_id', $dossierId)->get();

        if (!$repEntry || $itEntries->isEmpty()) return $alerts;

        $repImmat = array_filter([$repEntry->immatriculation_avant, $repEntry->immatriculation_arriere]);
        foreach ($itEntries as $it) {
            if (!empty($it->chassis) && !empty($repImmat)) {
                $match = false;
                foreach ($repImmat as $immat) {
                    if (str_contains($immat, $it->chassis) || str_contains($it->chassis, $immat)) {
                        $match = true;
                        break;
                    }
                }
                if (!$match) {
                    $alerts[] = [
                        'type' => 'incoherence_immatriculation',
                        'message' => "Châssis IT '{$it->chassis}' ne correspond à aucune immatriculation déclarée en représentation.",
                        'severity' => 'medium',
                    ];
                }
            }
        }

        return $alerts;
    }

    /**
     * Vérifie la cohérence de l'importateur entre la représentation et les docs barrière.
     */
    public function checkImportateurConsistency(string $dossierId): array
    {
        $alerts = [];
        $repEntry = RepresentationEntry::where('dossier_id', $dossierId)->first();
        if (!$repEntry || empty($repEntry->importateur)) return $alerts;

        $typingDocs = TypingDocDirect::where('dossier_id', $dossierId)->get();
        foreach ($typingDocs as $doc) {
            if (!empty($doc->importateur) && strcasecmp($repEntry->importateur, $doc->importateur) !== 0) {
                $alerts[] = [
                    'type' => 'incoherence_importateur',
                    'message' => "Importateur différent: Représentation='{$repEntry->importateur}', Document barrière='{$doc->importateur}'.",
                    'severity' => 'high',
                ];
            }
        }
        return $alerts;
    }

    /**
     * Vérifie la cohérence du pays de provenance entre modules.
     */
    public function checkPaysConsistency(string $dossierId): array
    {
        $alerts = [];
        $repEntry = RepresentationEntry::where('dossier_id', $dossierId)->first();
        $dossier = Dossier::find($dossierId);
        if (!$repEntry || !$dossier) return $alerts;

        if (!empty($repEntry->pays_provenance_nom) && !empty($dossier->pays)) {
            $repPays = strtolower(trim($repEntry->pays_provenance_nom));
            $dosPays = strtolower(trim($dossier->pays));
            if ($repPays !== $dosPays) {
                $alerts[] = [
                    'type' => 'incoherence_pays',
                    'message' => "Pays de provenance différent: Représentation='{$repEntry->pays_provenance_nom}', Dossier='{$dossier->pays}'.",
                    'severity' => 'high',
                ];
            }
        }
        return $alerts;
    }

    /**
     * Vérifie la cohérence du bureau entre les données de représentation et les docs barrière.
     */
    public function checkBureauConsistency(string $dossierId): array
    {
        $alerts = [];
        $repEntry = RepresentationEntry::where('dossier_id', $dossierId)->first();
        $typingDocs = TypingDocDirect::where('dossier_id', $dossierId)->get();

        if (!$repEntry || $typingDocs->isEmpty()) return $alerts;

        $repBureau = $repEntry->bureau_etranger_nom;
        foreach ($typingDocs as $doc) {
            if (!empty($repBureau) && !empty($doc->bureau_origine) && $repBureau !== $doc->bureau_origine) {
                $alerts[] = [
                    'type' => 'incoherence_bureau',
                    'message' => "Bureau différent: Représentation='{$repBureau}', Document barrière='{$doc->bureau_origine}'.",
                    'severity' => 'high',
                ];
            }
        }
        return $alerts;
    }

    /**
     * Exécute toutes les vérifications de cohérence pour un dossier.
     * Retourne un tableau d'alertes créées.
     */
    public function runAllConsistencyChecks(string $dossierId, int $triggerUserId): array
    {
        $allAlerts = [];

        $checks = [
            $this->checkWeightConsistency($dossierId),
            $this->checkContainerConsistency($dossierId),
            $this->checkDocumentContradictions($dossierId),
            $this->checkRepresentationVsItEntries($dossierId),
            $this->checkImportateurConsistency($dossierId),
            $this->checkPaysConsistency($dossierId),
            $this->checkBureauConsistency($dossierId),
        ];

        $targetRoles = ['inspecteur_chef', 'inspecteur'];

        foreach ($checks as $checkAlerts) {
            foreach ($checkAlerts as $alertData) {
                foreach ($targetRoles as $role) {
                    try {
                        $alert = Alerte::create([
                            'recipient_id' => null,
                            'dossier_id' => $dossierId,
                            'type' => $alertData['type'],
                            'title' => "[{$alertData['type']}] Dossier #{$dossierId}",
                            'message' => $alertData['message'],
                            'hierarchy_level' => 0,
                            'target_role' => $role,
                            'is_read' => false,
                            'triggered_by' => $triggerUserId,
                        ]);
                        $allAlerts[] = $alert;
                    } catch (\Exception $e) {
                        Log::error("AlerteService: " . $e->getMessage());
                    }
                }
            }
        }

        return $allAlerts;
    }
}

