<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Dossier;
use App\Models\RepresentationEntry;
use App\Models\RepresentationArticle;
use App\Models\Alerte;
use App\Services\DossierTimelineService;
use App\Services\AuditLogService;
use App\Services\AlerteService;
use Illuminate\Support\Facades\DB;

class RepresentationEntryController extends Controller
{
    protected AlerteService $alerteService;

    public function __construct(AlerteService $alerteService)
    {
        $this->alerteService = $alerteService;
    }

    /**
     * Récupère les données de représentation d'un dossier.
     */
    public function showByDossier(Request $request, string $dossierId): JsonResponse
    {
        Dossier::findOrFail($dossierId);

        $entry = RepresentationEntry::with(['articles', 'operateur'])
            ->where('dossier_id', $dossierId)
            ->first();

        return response()->json([
            'dossier_id' => $dossierId,
            'entry'      => $entry,
        ]);
    }

    /**
     * Opérateur saisie ou chef bureau repr crée/met à jour les données de représentation.
     */
    public function store(Request $request, string $dossierId): JsonResponse
    {
        $user = $request->user();

        if (!in_array($user->role, ['operateur_saisie', 'chef_bureau_repr', 'super_admin'])) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $dossier = Dossier::findOrFail($dossierId);

        $validated = $request->validate([
            'importateur'                  => 'nullable|string|max:255',
            'nif'                          => 'nullable|string|max:50',
            'bureau_etranger_code'         => 'nullable|string|max:20',
            'bureau_etranger_nom'          => 'nullable|string|max:255',
            'dra_reference'                => 'nullable|string|max:100',
            'dra_date'                     => 'nullable|date',
            't1_reference'                 => 'nullable|string|max:100',
            't1_date'                      => 'nullable|date',
            'immatriculation_avant'        => 'nullable|string|max:50',
            'immatriculation_arriere'      => 'nullable|string|max:50',
            'devise'                       => 'nullable|string|max:3',
            'pays_provenance_code'         => 'nullable|string|max:10',
            'pays_provenance_nom'          => 'nullable|string|max:100',
            'numero_conteneur'             => 'nullable|string|max:100',
            'container_20'                 => 'nullable|integer|min:0',
            'container_40'                 => 'nullable|integer|min:0',
            'incoterm'                     => 'nullable|string|max:10',
            'bureau_sortie_code'           => 'nullable|string|max:20',
            'bureau_sortie_nom'            => 'nullable|string|max:255',
            'observations'                 => 'nullable|string',
            'articles'                     => 'nullable|array',
            'articles.*.designation'       => 'required_with:articles|string|max:500',
            'articles.*.position_tarifaire'=> 'nullable|string|max:20',
            'articles.*.quantite'          => 'nullable|numeric|min:0',
            'articles.*.poids'             => 'nullable|numeric|min:0',
            'articles.*.fob'               => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Calculer FOB total depuis les articles
            $fobTotal = collect($validated['articles'] ?? [])->sum('fob');

            // Nettoyer les chaines vides (sécurité supplémentaire) et gérer les valeurs par défaut
            $safeData = collect($validated)->except('articles')->map(function($value, $key) {
                $val = $value === '' ? null : $value;
                if ($val === null) {
                    if ($key === 'devise') return 'USD';
                    if ($key === 'container_20' || $key === 'container_40') return 0;
                }
                return $val;
            })->toArray();

            // Créer ou mettre à jour l'entrée de représentation
            $entry = RepresentationEntry::updateOrCreate(
                ['dossier_id' => $dossierId],
                array_merge(
                    $safeData,
                    [
                        'operateur_id'   => $user->id,
                        'bureau_repr_id' => $user->bureau_id ?? null,
                        'fob_total'      => $fobTotal,
                        'status'         => 'soumis',
                    ]
                )
            );

            // Remplacer les articles (delete + recreate)
            if (isset($validated['articles'])) {
                RepresentationArticle::where('representation_entry_id', $entry->id)->delete();
                foreach ($validated['articles'] as $art) {
                    RepresentationArticle::create(array_merge($art, [
                        'representation_entry_id' => $entry->id,
                        'dossier_id'              => $dossierId,
                    ]));
                }
            }

            // Remonter certains champs vers le dossier principal
            $dossierUpdate = [];
            if (!empty($validated['dra_reference'])) {
                $dossierUpdate['dra'] = $validated['dra_reference'];
            }
            if (!empty($validated['t1_reference'])) {
                $dossierUpdate['t1'] = $validated['t1_reference'];
            }
            if (!empty($validated['importateur'])) {
                $dossierUpdate['importateur'] = $validated['importateur'];
            }
            if (!empty($validated['devise'])) {
                $dossierUpdate['devise'] = $validated['devise'];
            }
            if (!empty($dossierUpdate)) {
                $dossier->update($dossierUpdate);
            }

            // Alertes automatiques sur documents manquants
            $alertsCreated = 0;
            if (empty($validated['t1_reference'])) {
                $alertsCreated += $this->createAlert($dossier, 'DOCUMENT_MANQUANT', 'T1 manquant dans les données de représentation.', $user->id) ? 1 : 0;
            }
            if (empty($validated['dra_reference'])) {
                $alertsCreated += $this->createAlert($dossier, 'DOCUMENT_MANQUANT', 'DRA manquant dans les données de représentation.', $user->id) ? 1 : 0;
            }

            // Entrée dans la timeline du dossier
            DossierTimelineService::log(
                $dossier->id,
                $user->id,
                'REPRESENTATION_SAISIE',
                'representation',
                "Données de représentation saisies par {$user->full_name}. FOB total: {$fobTotal} USD."
            );

            AuditLogService::log('representation', 'store', $entry->id, null, [
                'dossier_id' => $dossierId,
                'fob_total' => $fobTotal,
                'operateur_id' => $user->id,
            ]);

            // Alertes de cohérence (poids, conteneur, contradictions)
            $consistencyAlerts = $this->alerteService->runAllConsistencyChecks($dossier->id, $user->id);

            DB::commit();

            // Aucune synchronisation physique automatique. 
            // La liaison se fait désormais de manière purement logique par référence DRA lors de la consultation.

            return response()->json([
                'message'         => 'Données de représentation enregistrées.',
                'entry'           => $entry->load('articles', 'operateur'),
                'alerts_created'  => $alertsCreated,
                'consistency_alerts' => count($consistencyAlerts),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur serveur: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Liste paginée des entrées de représentation (chef bureau repr / super_admin).
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = RepresentationEntry::with(['dossier', 'operateur', 'articles']);

        // Chef bureau repr ne voit que son bureau
        if ($user->role === 'chef_bureau_repr' && $user->bureau_id) {
            $query->where('bureau_repr_id', $user->bureau_id);
        }

        if ($request->filled('dossier_id')) {
            $query->where('dossier_id', $request->input('dossier_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('t1_reference')) {
            $query->where('t1_reference', 'like', '%' . $request->input('t1_reference') . '%');
        }

        $entries = $query->orderBy('created_at', 'desc')->paginate(50);
        return response()->json($entries);
    }

    /**
     * Statistiques pour dashboard Chef Bureau Repr.
     */
    public function stats(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = RepresentationEntry::query();

        if ($user->role === 'chef_bureau_repr' && $user->bureau_id) {
            $query->where('bureau_repr_id', $user->bureau_id);
        }

        $today = now()->toDateString();

        return response()->json([
            'total'     => (clone $query)->count(),
            'today'     => (clone $query)->whereDate('created_at', $today)->count(),
            'soumis'    => (clone $query)->where('status', 'soumis')->count(),
            'valides'   => (clone $query)->where('status', 'valide')->count(),
            'rejetes'   => (clone $query)->where('status', 'rejete')->count(),
            'fob_total' => (clone $query)->sum('fob_total'),
            'by_status' => RepresentationEntry::selectRaw('status, count(*) as count')
                ->when($user->role === 'chef_bureau_repr' && $user->bureau_id, fn ($q) => $q->where('bureau_repr_id', $user->bureau_id))
                ->groupBy('status')
                ->pluck('count', 'status'),
        ]);
    }

    /**
     * Crée une alerte pour les documents manquants.
     */
    private function createAlert(Dossier $dossier, string $type, string $message, int $userId): bool
    {
        try {
            Alerte::create([
                'target_role'  => 'inspecteur_chef',
                'type'         => 'alerte',
                'title'        => "[{$type}] Dossier {$dossier->reference}",
                'message'      => $message,
                'reference_id' => $dossier->id,
                'created_by'   => $userId,
            ]);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
