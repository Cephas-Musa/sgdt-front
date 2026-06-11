<?php

namespace App\Services;

use App\Models\Alerte;
use App\Models\User;
use App\Models\Dossier;
use App\Models\PushSubscription;
use App\Models\RepresentationEntry;
use App\Models\TypingDocDirect;
use App\Models\ItEntry;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
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
     * Send Web Push notification to user
     */
    private function notifyUser(User $user, Alerte $alert): void
    {
        $subscriptions = PushSubscription::where('user_id', $user->id)->get();
        if ($subscriptions->isEmpty()) {
            return;
        }

        $vapidPublic = config('services.vapid.public_key');
        $vapidPrivate = config('services.vapid.private_key');
        $vapidSubject = config('services.vapid.subject');

        if (!$vapidPublic || !$vapidPrivate) {
            Log::warning('VAPID keys not configured for Web Push');
            return;
        }

        $auth = [
            'VAPID' => [
                'subject' => $vapidSubject ?? 'mailto:admin@douanes.cd',
                'publicKey' => $vapidPublic,
                'privateKey' => $vapidPrivate,
            ],
        ];

        $webPush = new WebPush($auth);

        $payload = json_encode([
            'title' => $alert->title,
            'body' => mb_substr($alert->message, 0, 200),
            'icon' => '/assets/Logo-dgda.png',
            'badge' => '/assets/Logo-dgda.png',
            'tag' => 'alerte-' . $alert->id,
            'data' => [
                'url' => '/app/alertes/' . $alert->id,
                'alertId' => $alert->id,
                'type' => $alert->type,
                'severity' => $alert->severity,
            ],
        ]);

        foreach ($subscriptions as $sub) {
            try {
                $subscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'authToken' => $sub->auth_token,
                    'contentEncoding' => $sub->content_encoding,
                    'publicKey' => $sub->keys['p256dh'] ?? '',
                ]);

                $webPush->queueNotification($subscription, $payload);
            } catch (\Throwable $e) {
                Log::error('Web Push queue error: ' . $e->getMessage());
            }
        }

        // Flush all queued notifications
        try {
            $reports = $webPush->flush();
            foreach ($reports as $report) {
                if ($report->isSuccess()) continue;
                // Si l'abonnement a expiré ou est invalide, le supprimer
                $endpoint = $report->getEndpoint();
                Log::warning('Web Push failed for endpoint: ' . $endpoint);
                if ($report->isSubscriptionExpired()) {
                    PushSubscription::where('endpoint', $endpoint)->delete();
                }
            }
        } catch (\Throwable $e) {
            Log::error('Web Push flush error: ' . $e->getMessage());
        }
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

        $targetRoles = ['inspecteur_chef'];

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
                            'severity' => $alertData['severity'] ?? 'medium',
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

    // ═══════════════════════════════════════════════════════════════════
    //  14 RÈGLES MÉTIER — ALERTES DYNAMIQUES
    // ═══════════════════════════════════════════════════════════════════

    // ── Helpers ──

    private function getDossierByMouvement($mouvement): ?\App\Models\Dossier
    {
        if ($mouvement->dossier_id) {
            return \App\Models\Dossier::find($mouvement->dossier_id);
        }
        return null;
    }

    private function createBusinessAlert(string $dossierId, string $dossierRef, string $type, string $title, string $message, string $severity, array $targetRoles): array
    {
        $created = [];
        $users = \App\Models\User::whereIn('role', $targetRoles)->get();
        foreach ($users as $user) {
            try {
                $alert = Alerte::create([
                    'recipient_id' => $user->id,
                    'target_role' => $user->role,
                    'dossier_id' => $dossierId,
                    'type' => $type,
                    'title' => $title,
                    'message' => $message . " (RD: {$dossierRef})",
                    'severity' => $severity,
                    'is_read' => false,
                    'hierarchy_level' => 0,
                ]);
                $created[] = $alert;
            } catch (\Exception $e) {
                Log::error("AlerteService[{$type}]: " . $e->getMessage());
            }
        }
        return $created;
    }

    private function hasExistingAlert(string $type, string $dossierId): bool
    {
        return Alerte::where('type', $type)
            ->where('dossier_id', $dossierId)
            ->whereNull('resolved_at')
            ->exists();
    }

    private function getDossierRef($dossier): string
    {
        return $dossier ? ($dossier->reference ?? "RD-{$dossier->id}") : 'N/A';
    }

    /**
     * Règle 1 : Véhicule entrant au pays après transbordement à l'étranger
     */
    public function checkVehiculeTransbordementEtranger(): array
    {
        $allCreated = [];
        $entrees = \App\Models\MouvementStockage::where('type_mouvement', 'transbordement')
            ->whereNotNull('dossier_id')
            ->whereHas('dossier', function ($q) {
                $q->whereIn('status', ['en_cours', 'verifie', 'controle']);
            })
            ->whereNotIn('dossier_id', function ($q) {
                $q->select('dossier_id')->from('alertes')
                  ->where('type', 'vehicule_transbordement_etranger')
                  ->whereNull('resolved_at');
            })
            ->get();

        foreach ($entrees as $s) {
            $dossier = $s->dossier;
            if (!$dossier) continue;
            $ref = $this->getDossierRef($dossier);
            if ($this->hasExistingAlert('vehicule_transbordement_etranger', $dossier->id)) continue;
            $created = $this->createBusinessAlert(
                $dossier->id, $ref,
                'vehicule_transbordement_etranger',
                'Véhicule transbordé à l\'étranger entré au pays',
                "Un véhicule ayant effectué un transbordement à l'étranger est entré sur le territoire.",
                'medium',
                ['inspecteur_chef']
            );
            $allCreated = array_merge($allCreated, $created);
        }
        return $allCreated;
    }

    /**
     * Règle 2 : Véhicule entré par barrière mais absent de l'entrepôt après 24h
     */
    public function checkVehiculeAbsentEntrepot24h(): array
    {
        $allCreated = [];
        $barriereEntries = \App\Models\BarriereEntry::where('date_passage', '<', now()->subHours(24))
            ->where(function ($q) { $q->whereNull('status')->where('status', '!=', 'sorti'); })
            ->whereNotNull('dossier_id')
            ->whereNotIn('dossier_id', function ($q) {
                $q->select('dossier_id')->from('mouvements_stockage')
                  ->where('type_mouvement', 'entree');
            })
            ->get();

        foreach ($barriereEntries as $entry) {
            $dossier = \App\Models\Dossier::find($entry->dossier_id);
            if (!$dossier) continue;
            $ref = $this->getDossierRef($dossier);
            if ($this->hasExistingAlert('vehicule_absent_entrepot_24h', $dossier->id)) continue;
            $created = $this->createBusinessAlert(
                $dossier->id, $ref,
                'vehicule_absent_entrepot_24h',
                'Véhicule absent de l\'entrepôt après 24h',
                "Véhicule enregistré à la barrière d'entrée pays il y a plus de 24h mais aucun enregistrement d'entrée entrepôt trouvé.",
                'high',
                ['inspecteur_chef']
            );
            $allCreated = array_merge($allCreated, $created);
        }
        return $allCreated;
    }

    /**
     * Règle 3 : Véhicule passé par barrière contrôle sans passage entrepôt
     * DossierControle est lié au dossier via reference_douane.
     */
    public function checkVehiculeBarriereControleSansEntrepot(): array
    {
        $allCreated = [];
        $controles = \App\Models\DossierControle::whereNotNull('reference_douane')->get();

        foreach ($controles as $c) {
            $dossier = \App\Models\Dossier::where('reference_douane', $c->reference_douane)->first();
            if (!$dossier) continue;
            $aEntreeEntrepot = \App\Models\MouvementStockage::where('dossier_id', $dossier->id)
                ->where('type_mouvement', 'entree')->exists();
            if ($aEntreeEntrepot) continue;

            $ref = $this->getDossierRef($dossier);
            if ($this->hasExistingAlert('vehicule_barriere_controle_sans_entrepot', $dossier->id)) continue;
            $created = $this->createBusinessAlert(
                $dossier->id, $ref,
                'vehicule_barriere_controle_sans_entrepot',
                'Véhicule en barrière contrôle sans passage entrepôt',
                "Véhicule passé par une barrière de contrôle sans enregistrement de passage en entrepôt.",
                'critical',
                ['inspecteur_chef']
            );
            $allCreated = array_merge($allCreated, $created);
        }
        return $allCreated;
    }

    /**
     * Règle 4 : Véhicule chargé entré/ressorti sans dédouanement
     */
    public function checkVehiculeChargeSortieSansDedouanement(): array
    {
        $allCreated = [];
        $dossierIds = \App\Models\MouvementStockage::where('type_mouvement', 'entree')
            ->where('quantite', '>', 0)
            ->whereNotNull('dossier_id')
            ->pluck('dossier_id');

        $sortis = \App\Models\MouvementStockage::where('type_mouvement', 'sortie')
            ->where('quantite', '>', 0)
            ->whereIn('dossier_id', $dossierIds)
            ->whereNotNull('dossier_id')
            ->pluck('dossier_id')
            ->unique();

        foreach ($sortis as $dossierId) {
            $dossier = \App\Models\Dossier::find($dossierId);
            if (!$dossier) continue;
            if ($dossier->status === 'apure' || $dossier->status === 'termine') continue;

            $hasApurement = \App\Models\Apurement::where('dossier_id', $dossierId)
                ->whereIn('status', ['valide', 'soumis'])->exists();
            if ($hasApurement) continue;

            $hasRapportValide = \App\Models\DossierValidation::where('dossier_id', $dossierId)
                ->where('status', 'valid')->exists();
            if ($hasRapportValide) continue;

            $ref = $this->getDossierRef($dossier);
            if ($this->hasExistingAlert('vehicule_charge_sortie_sans_dedouanement', $dossierId)) continue;
            $created = $this->createBusinessAlert(
                $dossierId, $ref,
                'vehicule_charge_sortie_sans_dedouanement',
                'Véhicule chargé sorti sans dédouanement',
                "Véhicule entré chargé et ressorti chargé sans dédouanement ni apurement ni rapport validé.",
                'critical',
                ['inspecteur_chef']
            );
            $allCreated = array_merge($allCreated, $created);
        }
        return $allCreated;
    }

    /**
     * Règle 5 : Véhicule chargé entré/sorti après apurement Chef Entrepôt Douane
     */
    public function checkVehiculeChargeSortieApresApurement(): array
    {
        $allCreated = [];
        $apurements = \App\Models\Apurement::where('type_appurement', 'entrepot')
            ->where('status', 'valide')
            ->whereNotNull('dossier_id')
            ->get();

        foreach ($apurements as $ap) {
            $entree = \App\Models\MouvementStockage::where('dossier_id', $ap->dossier_id)
                ->where('type_mouvement', 'entree')
                ->where('quantite', '>', 0)->exists();
            $sortie = \App\Models\MouvementStockage::where('dossier_id', $ap->dossier_id)
                ->where('type_mouvement', 'sortie')
                ->where('quantite', '>', 0)->exists();

            if (!$entree || !$sortie) continue;
            $dossier = \App\Models\Dossier::find($ap->dossier_id);
            if (!$dossier) continue;
            $ref = $this->getDossierRef($dossier);
            if ($this->hasExistingAlert('vehicule_charge_sortie_apres_apurement', $dossier->id)) continue;
            $created = $this->createBusinessAlert(
                $dossier->id, $ref,
                'vehicule_charge_sortie_apres_apurement',
                'Véhicule chargé entré/sorti après apurement Chef Entrepôt',
                "Véhicule entré chargé et ressorti chargé. Un apurement Chef Entrepôt Douane a été validé.",
                'low',
                ['chef_entrepot_douane']
            );
            $allCreated = array_merge($allCreated, $created);
        }
        return $allCreated;
    }

    /**
     * Règle 6 : Historique complet manipulation de marchandise
     */
    public function checkHistoriqueManipulation(): array
    {
        $allCreated = [];
        $dossierIds = \App\Models\MouvementStockage::whereIn('type_mouvement', ['entree', 'dechargement', 'transbordement', 'rechargement', 'sortie'])
            ->whereNotNull('dossier_id')
            ->pluck('dossier_id')
            ->unique();

        foreach ($dossierIds as $dossierId) {
            $etapes = \App\Models\MouvementStockage::where('dossier_id', $dossierId)
                ->whereIn('type_mouvement', ['entree', 'dechargement', 'transbordement', 'rechargement', 'sortie'])
                ->orderBy('created_at')
                ->pluck('type_mouvement')
                ->unique()->values()->toArray();

            $expected = ['entree', 'dechargement', 'rechargement', 'sortie'];
            $hasFull = count(array_intersect($expected, $etapes)) === count($expected);

            if (!$hasFull) continue;
            $dossier = \App\Models\Dossier::find($dossierId);
            if (!$dossier) continue;
            $ref = $this->getDossierRef($dossier);
            if ($this->hasExistingAlert('historique_manipulation_complet', $dossierId)) continue;

            $message = "Historique complet: " . implode(' → ', $etapes);
            $created = $this->createBusinessAlert(
                $dossierId, $ref,
                'historique_manipulation_complet',
                'Historique complet de manipulation de marchandise',
                $message,
                'low',
                ['inspecteur_chef', 'directeur_provincial', 'agent_controle']
            );
            $allCreated = array_merge($allCreated, $created);
        }
        return $allCreated;
    }

    /**
     * Règle 7 : Véhicule entré vide et ressorti chargé
     */
    public function checkVehiculeEntreVideSortiCharge(): array
    {
        $allCreated = [];
        $entresVide = \App\Models\MouvementStockage::where('type_mouvement', 'entree')
            ->where(function ($q) { $q->where('quantite', 0)->orWhereNull('quantite'); })
            ->whereNotNull('dossier_id')
            ->pluck('dossier_id');

        $sortisCharge = \App\Models\MouvementStockage::where('type_mouvement', 'sortie')
            ->where('quantite', '>', 0)
            ->whereIn('dossier_id', $entresVide)
            ->whereNotNull('dossier_id')
            ->with('dossier')
            ->get();

        foreach ($sortisCharge as $s) {
            $dossier = \App\Models\Dossier::find($s->dossier_id);
            if (!$dossier) continue;
            $ref = $this->getDossierRef($dossier);
            if ($this->hasExistingAlert('vehicule_entre_vide_sorti_charge', $dossier->id)) continue;

            $chargement = \App\Models\MouvementStockage::where('dossier_id', $dossier->id)
                ->where('type_mouvement', 'rechargement')->first();
            $refDouane = $dossier->reference_douane ?? 'N/A';
            $msg = "Véhicule entré vide et ressorti chargé.";
            if ($chargement) $msg .= " Marchandise chargée: {$chargement->quantite} unités, {$chargement->poids} kg.";
            $msg .= " Réf douane: {$refDouane}.";

            $created = $this->createBusinessAlert(
                $dossier->id, $ref,
                'vehicule_entre_vide_sorti_charge',
                'Véhicule entré vide et ressorti chargé',
                $msg,
                'critical',
                ['inspecteur_chef', 'directeur_provincial', 'agent_controle']
            );
            $allCreated = array_merge($allCreated, $created);
        }
        return $allCreated;
    }

    /**
     * Règle 8 : Sortie d'entrepôt sans référence douane
     */
    public function checkSortieSansRefDouane(): array
    {
        $allCreated = [];
        $sorties = \App\Models\Mouvement::where('operation_type', 'sortie')
            ->whereNotNull('dossier_id')
            ->get();

        foreach ($sorties as $m) {
            $dossier = $this->getDossierByMouvement($m);
            if (!$dossier) continue;
            if ($dossier->reference_douane) continue;
            $ref = $this->getDossierRef($dossier);
            if ($this->hasExistingAlert('sortie_sans_ref_douane', $dossier->id)) continue;
            $created = $this->createBusinessAlert(
                $dossier->id, $ref,
                'sortie_sans_ref_douane',
                'Sortie d\'entrepôt sans référence douane',
                "Une sortie d'entrepôt a été enregistrée sans référence douane associée au dossier.",
                'critical',
                ['inspecteur_chef', 'directeur_provincial', 'agent_controle']
            );
            $allCreated = array_merge($allCreated, $created);
        }
        return $allCreated;
    }

    /**
     * Règle 9 : Sortie d'entrepôt sans bon de sortie
     */
    public function checkSortieSansBonSortie(): array
    {
        $allCreated = [];
        $sorties = \App\Models\Mouvement::where('operation_type', 'sortie')
            ->whereNotNull('dossier_id')
            ->get();

        foreach ($sorties as $m) {
            $dossier = $this->getDossierByMouvement($m);
            if (!$dossier) continue;
            $hasBonSortie = \App\Models\Decharge::where('dossier_id', $dossier->id)->exists();
            if ($hasBonSortie) continue;
            $ref = $this->getDossierRef($dossier);
            if ($this->hasExistingAlert('sortie_sans_bon_sortie', $dossier->id)) continue;
            $created = $this->createBusinessAlert(
                $dossier->id, $ref,
                'sortie_sans_bon_sortie',
                'Sortie d\'entrepôt sans bon de sortie',
                "Une sortie d'entrepôt a été enregistrée sans bon de sortie (décharge) associé au dossier.",
                'critical',
                ['inspecteur_chef', 'directeur_provincial', 'agent_controle']
            );
            $allCreated = array_merge($allCreated, $created);
        }
        return $allCreated;
    }

    /**
     * Règle 10 : Même référence douane sur plusieurs dossiers RD
     */
    public function checkDoublonRefDouane(): array
    {
        $allCreated = [];
        $doublons = \App\Models\Dossier::whereNotNull('reference_douane')
            ->selectRaw('reference_douane, COUNT(DISTINCT reference) as cnt')
            ->groupBy('reference_douane')
            ->having('cnt', '>', 1)
            ->get();

        foreach ($doublons as $row) {
            $dossiers = \App\Models\Dossier::where('reference_douane', $row->reference_douane)->get();
            $refs = $dossiers->pluck('reference')->implode(', ');
            foreach ($dossiers as $dossier) {
                if ($this->hasExistingAlert('doublon_ref_douane', $dossier->id)) continue;
                $created = $this->createBusinessAlert(
                    $dossier->id, $this->getDossierRef($dossier),
                    'doublon_ref_douane',
                    'Même référence douane sur plusieurs dossiers',
                    "La référence douane '{$row->reference_douane}' est utilisée sur plusieurs dossiers: {$refs}",
                    'critical',
                    ['inspecteur_chef', 'directeur_provincial', 'agent_controle']
                );
                $allCreated = array_merge($allCreated, $created);
            }
        }
        return $allCreated;
    }

    /**
     * Règle 11 : Même bon de sortie sur plusieurs dossiers RD
     */
    public function checkDoublonBonSortie(): array
    {
        $allCreated = [];
        $doublons = \App\Models\Decharge::selectRaw('reference, COUNT(DISTINCT dossier_id) as cnt')
            ->groupBy('reference')
            ->having('cnt', '>', 1)
            ->get();

        foreach ($doublons as $row) {
            $decharges = \App\Models\Decharge::where('reference', $row->reference)->get();
            foreach ($decharges as $d) {
                if (!$d->dossier_id) continue;
                if ($this->hasExistingAlert('doublon_bon_sortie', $d->dossier_id)) continue;
                $dossier = \App\Models\Dossier::find($d->dossier_id);
                $ref = $dossier ? $this->getDossierRef($dossier) : $d->dossier_id;
                $created = $this->createBusinessAlert(
                    $d->dossier_id, $ref,
                    'doublon_bon_sortie',
                    'Même bon de sortie sur plusieurs dossiers',
                    "Le bon de sortie '{$row->reference}' est utilisé sur {$row->cnt} dossiers différents.",
                    'critical',
                    ['inspecteur_chef', 'directeur_provincial', 'agent_controle']
                );
                $allCreated = array_merge($allCreated, $created);
            }
        }
        return $allCreated;
    }

    /**
     * Règle 12 : Plaque déclaration différente de la plaque de sortie
     */
    public function checkPlaqueIncoherence(): array
    {
        $allCreated = [];
        $sorties = \App\Models\Mouvement::where('operation_type', 'sortie')
            ->whereNotNull('plaque')
            ->whereNotNull('dossier_id')
            ->get();

        foreach ($sorties as $m) {
            $dossier = $this->getDossierByMouvement($m);
            if (!$dossier) continue;
            $plaqueDeclaration = $dossier->plaque_avant ?? $dossier->plaque;
            if (!$plaqueDeclaration) continue;
            if (strcasecmp(trim($plaqueDeclaration), trim($m->plaque)) === 0) continue;

            if ($this->hasExistingAlert('plaque_incoherence', $dossier->id)) continue;
            $created = $this->createBusinessAlert(
                $dossier->id, $this->getDossierRef($dossier),
                'plaque_incoherence',
                'Plaque déclaration différente de la plaque de sortie',
                "Plaque déclaration '{$plaqueDeclaration}' différente de la plaque enregistrée à la sortie '{$m->plaque}'.",
                'critical',
                ['inspecteur_chef', 'directeur_provincial', 'agent_controle']
            );
            $allCreated = array_merge($allCreated, $created);
        }
        return $allCreated;
    }

    /**
     * Règle 13 : Référence DRA différente de la référence T1 — déjà existante via checkDRAT1Consistency
     * Ici on fait une version inter-dossiers : DRA != T1 sur un même dossier
     */
    public function checkDRAT1Incoherence(): array
    {
        $allCreated = [];
        $dossiers = \App\Models\Dossier::whereNotNull('dra')
            ->whereNotNull('t1')
            ->whereColumn('dra', '!=', 't1')
            ->get();

        foreach ($dossiers as $dossier) {
            if ($this->hasExistingAlert('incoherence_dra_t1', $dossier->id)) continue;
            $ref = $this->getDossierRef($dossier);
            $created = $this->createBusinessAlert(
                $dossier->id, $ref,
                'incoherence_dra_t1',
                'Référence DRA différente de T1',
                "La référence DRA '{$dossier->dra}' est différente de la référence T1 '{$dossier->t1}'.",
                'critical',
                ['verificateur', 'inspecteur_chef']
            );
            $allCreated = array_merge($allCreated, $created);
        }
        return $allCreated;
    }

    /**
     * Règle 14 : Véhicule déclaré sortant vers l'étranger sans passage barrière pays après 24h
     */
    public function checkVehiculeSortieSansBarriere24h(): array
    {
        $allCreated = [];
        $mouvements = \App\Models\Mouvement::where('operation_type', 'sortie')
            ->whereIn('sub_type_operation', ['export', 'etranger', 'declaration_sortie'])
            ->where('date_mouvement', '<', now()->subHours(24))
            ->whereNotNull('dossier_id')
            ->whereNotIn('dossier_id', function ($q) {
                $q->select('dossier_id')->from('barriere_entries');
            })
            ->get();

        foreach ($mouvements as $m) {
            $dossier = $this->getDossierByMouvement($m);
            if (!$dossier) continue;
            $ref = $this->getDossierRef($dossier);
            if ($this->hasExistingAlert('vehicule_sortie_sans_barriere_24h', $dossier->id)) continue;
            $created = $this->createBusinessAlert(
                $dossier->id, $ref,
                'vehicule_sortie_sans_barriere_24h',
                'Véhicule sortant vers l\'étranger sans barrière pays',
                "Véhicule déclaré sortant vers l'étranger il y a plus de 24h mais aucune trace de passage à la barrière de sortie pays.",
                'critical',
                ['inspecteur_chef']
            );
            $allCreated = array_merge($allCreated, $created);
        }
        return $allCreated;
    }

    /**
     * Exécute toutes les 14 règles métier et retourne le nombre total d'alertes créées
     */
    public function runAllBusinessRules(): array
    {
        $allCreated = [];
        $rules = [
            [$this, 'checkVehiculeTransbordementEtranger'],
            [$this, 'checkVehiculeAbsentEntrepot24h'],
            [$this, 'checkVehiculeBarriereControleSansEntrepot'],
            [$this, 'checkVehiculeChargeSortieSansDedouanement'],
            [$this, 'checkVehiculeChargeSortieApresApurement'],
            [$this, 'checkHistoriqueManipulation'],
            [$this, 'checkVehiculeEntreVideSortiCharge'],
            [$this, 'checkSortieSansRefDouane'],
            [$this, 'checkSortieSansBonSortie'],
            [$this, 'checkDoublonRefDouane'],
            [$this, 'checkDoublonBonSortie'],
            [$this, 'checkPlaqueIncoherence'],
            [$this, 'checkDRAT1Incoherence'],
            [$this, 'checkVehiculeSortieSansBarriere24h'],
        ];

        foreach ($rules as $rule) {
            try {
                $result = call_user_func($rule);
                $allCreated = array_merge($allCreated, $result);
            } catch (\Exception $e) {
                Log::error("AlerteService rule error: " . $e->getMessage());
            }
        }

        return $allCreated;
    }
}

