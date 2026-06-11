<?php

namespace App\Services;

use App\Models\Dossier;
use App\Models\UserDossierHistory;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class DossierAccessService
{
    /**
     * Recherche un dossier par référence avec vérification stricte RBAC.
     */
    public function searchByReference(string $reference, User $user): ?Dossier
    {
        // Normaliser la référence: accepter rd-0001, RD-0001, RD0001, 0001
        $normalized = strtoupper(trim($reference));
        $normalized = preg_replace('/^RD-?/', 'RD-', $normalized);
        if (!str_starts_with($normalized, 'RD-')) {
            $normalized = 'RD-' . $normalized;
        }

        $dossier = Dossier::with(['articles', 'creator', 'inspecteur', 'secretary', 'workflows', 'timelines', 'documents', 'representationEntry.articles', 'typingDocsDirect', 'typingDocsTranshipment', 'itEntries'])
            ->whereRaw('UPPER(reference) = ?', [$normalized])
            ->first();

        if (!$dossier) {
            return null;
        }

        // Vérification des accès (RBAC / Propriété)
        if (!$this->canAccess($user, $dossier)) {
            return null; // On masque complètement l'existence du dossier si pas d'accès
        }

        // Enregistrer la consultation dans l'historique de l'utilisateur
        $this->logHistory($user->id, $dossier, 'consultation', 'search');

        // Audit Global
        AuditLogService::log('dossier_search', 'consultation', $dossier->id, null, ['reference' => $reference]);

        return $dossier;
    }

    /**
     * Loggue une action dans l'historique personnel de l'utilisateur.
     */
    public function logHistory(int $userId, Dossier $dossier, string $action, string $module): void
    {
        // Supprimer une éventuelle ancienne trace identique (même user, même dossier)
        // pour ne garder que la plus récente dans l'historique (update "last seen")
        UserDossierHistory::where('user_id', $userId)
            ->where('dossier_id', $dossier->id)
            ->delete();

        UserDossierHistory::create([
            'user_id' => $userId,
            'dossier_id' => $dossier->id,
            'reference' => $dossier->reference,
            'action' => $action,
            'module' => $module,
        ]);
    }

    /**
     * Récupère les dossiers actifs (non appurés) selon la hiérarchie de l'utilisateur.
     * Ces dossiers sont visibles "par défaut" sans recherche.
     */
    public function getActiveDossiers(User $user)
    {
        $query = Dossier::with(['articles', 'creator', 'inspecteur', 'secretary', 'representationEntry.articles', 'typingDocsDirect', 'typingDocsTranshipment', 'itEntries'])
                        ->where('status', '!=', 'appure');

        if ($user->role === 'directeur_provincial') {
            $provinceId = $user->province_id;
            if ($provinceId) {
                $query->where(function($q) use ($provinceId) {
                    $q->where('province_id', $provinceId)
                      ->orWhereHas('creator', function($cq) use ($provinceId) {
                          $cq->where('province_id', $provinceId);
                      });
                });
            }
        } elseif (in_array($user->role, [
            'inspecteur_chef_bureau',
            'inspecteur_chef',
            'agent_controle',
            'verificateur',
            'brigadier_barriere',
            'brigadier',
            'typing_operator',
            'agent_pointage',
            'chef_recherche',
            'chef_barriere',
        ])) {
            $query->where(function($q) use ($user) {
                $q->where(function($inner) use ($user) {
                    // Dossiers du bureau de l'utilisateur
                    if ($user->bureau_id) {
                        $inner->where('bureau_id', $user->bureau_id);
                    }
                    // Dossiers créés par l'utilisateur lui-même
                    $inner->orWhere('created_by', $user->id);
                    // Dossiers assignés à l'utilisateur comme inspecteur
                    $inner->orWhere('inspecteur_id', $user->id);
                });

                // Dossiers affectés à cet agent via colisage_affectations
                if ($user->role === 'agent_pointage') {
                    $q->orWhereIn('id', function($sub) use ($user) {
                        $sub->select('dossier_id')
                            ->from('colisage_affectations')
                            ->where('agent_id', $user->id);
                    });
                }
                
                // Dossiers créés par operateur_saisie/chef_bureau_repr (consultation)
                if (in_array($user->role, ['inspecteur_chef_bureau', 'inspecteur_chef', 'agent_controle'])) {
                    $q->orWhereHas('creator', function($cq) {
                        $cq->whereIn('role', ['operateur_saisie', 'chef_bureau_repr']);
                    });
                }
            });
        } elseif ($user->role === 'chef_bureau_repr') {
            // Le chef bureau représentation ne voit que les dossiers créés par la représentation
            // (operateur_saisie / chef_bureau_repr), jamais ceux créés par un inspecteur
            $query->where(function($q) use ($user) {
                $q->whereHas('creator', function($cq) {
                    $cq->whereIn('role', ['operateur_saisie', 'chef_bureau_repr']);
                });
                if ($user->bureau_id) {
                    $q->orWhere(function($orQ) use ($user) {
                        $orQ->whereHas('representationEntry', function($reprQ) use ($user) {
                            $reprQ->where('bureau_repr_id', $user->bureau_id);
                        })->whereHas('creator', function($cq) {
                            $cq->whereIn('role', ['operateur_saisie', 'chef_bureau_repr']);
                        });
                    });
                }
            });
            if ($user->bureau_id) {
                $query->where(function($q) use ($user) {
                    $q->where('bureau_id', $user->bureau_id)
                      ->orWhereHas('representationEntry', function($reprQ) use ($user) {
                          $reprQ->where('bureau_repr_id', $user->bureau_id);
                      });
                });
            }
        } elseif ($user->role === 'operateur_saisie') {
            $query->where(function($q) use ($user) {
                $q->whereHas('creator', function($creatorQ) {
                    $creatorQ->where('role', 'operateur_saisie');
                });
                if ($user->bureau_id) {
                    $q->orWhereHas('representationEntry', function($reprQ) use ($user) {
                        $reprQ->where('bureau_repr_id', $user->bureau_id);
                    });
                }
            });
            if ($user->bureau_id) {
                $query->where(function($q) use ($user) {
                    $q->where('bureau_id', $user->bureau_id)
                      ->orWhereHas('representationEntry', function($reprQ) use ($user) {
                          $reprQ->where('bureau_repr_id', $user->bureau_id);
                      });
                });
            }
        } elseif ($user->role === 'secretaire_inspecteur') {
            $query->where(function($q) use ($user) {
                $q->where('secretary_id', $user->id);
                $supervisor = $user->supervisor;
                if ($supervisor) {
                    $q->orWhere('inspecteur_id', $supervisor->id);
                    if ($supervisor->bureau_id) {
                        $q->orWhere('bureau_id', $supervisor->bureau_id);
                    }
                    $q->orWhereHas('creator', function($cq) use ($supervisor) {
                        $cq->whereIn('role', ['operateur_saisie', 'chef_bureau_repr']);
                        if ($supervisor->bureau_id) {
                            $cq->where('bureau_id', $supervisor->bureau_id);
                        }
                    });
                }
            });
        } elseif (in_array($user->role, ['super_admin', 'directeur_general'])) {
            // Superadmin et DG voient tout ce qui n'est pas appuré
        } else {
            // Pour tous les autres, la liste par défaut doit être vide, car ils doivent chercher le dossier d'abord.
            $query->where('id', '<', 0);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Récupère l'historique récent de l'utilisateur.
     */
    public function getUserHistory(User $user, int $limit = 20)
    {
        return UserDossierHistory::with('dossier')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->pluck('dossier') // Retourner directement les dossiers concernés
            ->filter(); // Enlever les nulls potentiels si SoftDeleted
    }

    /**
     * Vérification stricte d'accès au dossier selon le rôle.
     */
    protected function canAccess(User $user, Dossier $dossier): bool
    {
        if (in_array($user->role, ['super_admin', 'directeur_general'])) {
            return true;
        }

        if (in_array($user->role, ['directeur_provincial'])) {
            if ($user->province_id === $dossier->province_id) {
                return true;
            }
            // Fallback: vérifier via le créateur du dossier
            if ($dossier->creator && $user->province_id === $dossier->creator->province_id) {
                return true;
            }
            return false;
        }

        // Rôles liés à un bureau (Chef de bureau, Agent, Vérificateur, etc.)
        if (in_array($user->role, [
            'inspecteur_chef_bureau',
            'inspecteur_chef',
            'agent_controle',
            'verificateur',
            'brigadier',
            'typing_operator',
            'chef_recherche'
        ])) {
            return $user->bureau_id === $dossier->bureau_id;
        }

        // Agent de pointage: accès via affectation ou même bureau
        if ($user->role === 'agent_pointage') {
            if ($user->bureau_id === $dossier->bureau_id) return true;
            // Vérifier si le dossier est affecté à cet agent
            return \App\Models\ColisageAffectation::where('dossier_id', $dossier->id)
                ->where('agent_id', $user->id)
                ->exists();
        }

        // Chef bureau représentation et opérateur saisie: ne voient que les dossiers créés par la représentation
        if (in_array($user->role, ['chef_bureau_repr', 'operateur_saisie'])) {
            if ($user->bureau_id !== $dossier->bureau_id) return false;
            return $dossier->creator && in_array($dossier->creator->role, ['operateur_saisie', 'chef_bureau_repr']);
        }

        // Un inspecteur ne voit que ses propres dossiers, et ceux créés par le bureau de représentation pour son bureau
        if ($user->role === 'inspecteur_chef') {
            if ($user->id === $dossier->inspecteur_id) {
                return true;
            }
            if ($user->id === $dossier->created_by) {
                return true;  // Les dossiers créés par cet inspecteur
            }
            if ($user->id === $dossier->secretary_id) {
                return true;  // Son secrétaire peut y accéder, l'inspecteur aussi
            }
            if ($user->bureau_id === $dossier->bureau_id && $dossier->creator && in_array($dossier->creator->role, ['operateur_saisie', 'chef_bureau_repr'])) {
                return true;
            }
            return false;
        }

        // Un secrétaire voit TOUT ce que son inspecteur superviseur voit
        if ($user->role === 'secretaire_inspecteur') {
            if ($user->id === $dossier->secretary_id) return true;
            $supervisor = $user->supervisor;
            if (!$supervisor) return false;
            // Hériter des accès de l'inspecteur superviseur
            if ($supervisor->id === $dossier->inspecteur_id) return true;
            if ($supervisor->id === $dossier->created_by) return true;
            if ($supervisor->id === $dossier->secretary_id) return true;
            if ($supervisor->bureau_id === $dossier->bureau_id) return true;
            if ($supervisor->bureau_id === $dossier->bureau_id && $dossier->creator && in_array($dossier->creator->role, ['operateur_saisie', 'chef_bureau_repr'])) return true;
            return false;
        }

        // Chef Entrepôt Douane: accès à tous les dossiers via recherche (recherche par référence)
        if (in_array($user->role, ['chef_entrepot_douane'])) {
            return true;
        }

        // Autres partenaires, caissiers, etc. -> Accès global ou restreint par d'autres règles
        return true;
    }
}
