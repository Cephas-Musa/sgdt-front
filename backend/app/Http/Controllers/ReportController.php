<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Dossier;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Apurement;
use App\Models\Mouvement;
use Illuminate\Support\Collection;

class ReportController extends Controller
{
    /**
     * Rapport des dossiers
     */
    public function dossierReport(Request $request)
    {
        $user = $request->user();

        $query = Dossier::with(['user', 'articles']);

        // Filtrer selon le rôle
        if ($user->role === 'directeur_provincial') {
            $query->where('province', $user->province ?? '');
        } elseif (in_array($user->role, ['inspecteur_chef_bureau', 'inspecteur_chef'])) {
            $query->where('bureau_repr', $user->bureau ?? '');
        }

        // Filtres optionnels
        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('created_at', [
                $request->input('date_from'),
                $request->input('date_to')
            ]);
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        $dossiers = $query->get();

        $summary = [
            'total_dossiers' => $dossiers->count(),
            'par_status' => $dossiers->groupBy('status')->map->count(),
            'par_type' => $dossiers->groupBy('type')->map->count(),
            'montant_total' => $dossiers->sum('montant'),
            'quantite_totale' => $dossiers->sum('quantite'),
        ];

        return response()->json([
            'summary' => $summary,
            'dossiers' => $dossiers,
        ]);
    }

    /**
     * Rapport financier
     */
    public function financialReport(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['super_admin', 'directeur_general', 'directeur_provincial'])) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $query = Transaction::query();

        // Filtrer selon le rôle
        if ($user->role === 'directeur_provincial') {
            // Les transactions liées aux dossiers de la province
            $query->whereHas('user.province', function($q) use ($user) {
                $q->where('province_id', $user->province_id);
            });
        }

        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('created_at', [
                $request->input('date_from'),
                $request->input('date_to')
            ]);
        }

        $transactions = $query->get();

        $summary = [
            'total_transactions' => $transactions->count(),
            'total_montant' => $transactions->sum('montant'),
            'par_status' => $transactions->groupBy('status')->map->count(),
            'par_type' => $transactions->groupBy('type')->map(function($items) {
                return [
                    'count' => $items->count(),
                    'total' => $items->sum('montant'),
                ];
            }),
        ];

        return response()->json([
            'summary' => $summary,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Rapport d'appurements
     */
    public function clearanceReport(Request $request)
    {
        $user = $request->user();

        $query = Apurement::with(['dossier', 'user']);

        // Filtrer selon le rôle
        if (in_array($user->role, ['inspecteur_chef_bureau', 'inspecteur_chef'])) {
            $query->whereHas('dossier', function($q) use ($user) {
                $q->where('bureau_repr', $user->bureau ?? '');
            });
        }

        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('created_at', [
                $request->input('date_from'),
                $request->input('date_to')
            ]);
        }

        $apurements = $query->get();

        $summary = [
            'total_apurements' => $apurements->count(),
            'par_status' => $apurements->groupBy('status')->map->count(),
            'temps_moyen_appurement' => $this->calculateAverageTime($apurements),
            'par_verifieur' => $apurements->groupBy('user.full_name')->map->count(),
        ];

        return response()->json([
            'summary' => $summary,
            'apurements' => $apurements,
        ]);
    }

    /**
     * Rapport de performance des agents
     */
    public function agentPerformanceReport(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['super_admin', 'directeur_general', 'directeur_provincial', 'inspecteur_chef_bureau'])) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Récupérer tous les agents selon le rôle
        $query = User::whereNotNull('created_by');

        if ($user->role === 'directeur_provincial') {
            $query->where('province_id', $user->province_id);
        } elseif (in_array($user->role, ['inspecteur_chef_bureau', 'inspecteur_chef'])) {
            $query->where('bureau_id', $user->bureau_id);
        }

        $agents = $query->get();

        $performance = $agents->map(function($agent) {
            $dossiers = Dossier::where('user_id', $agent->id)->get();
            $mouvements = Mouvement::where('user_id', $agent->id)->get();

            return [
                'agent_id' => $agent->id,
                'name' => $agent->full_name,
                'role' => $agent->role,
                'dossiers_created' => $dossiers->count(),
                'dossiers_completed' => $dossiers->where('status', 'termine')->count(),
                'mouvements_recorded' => $mouvements->count(),
                'average_processing_time' => $this->calculateAverageTime($dossiers),
                'success_rate' => $dossiers->count() > 0
                    ? round(($dossiers->where('status', 'termine')->count() / $dossiers->count()) * 100, 2)
                    : 0,
            ];
        });

        return response()->json([
            'performance' => $performance,
        ]);
    }

    /**
     * Rapport des mouvements véhicules
     */
    public function vehicleMovementReport(Request $request)
    {
        $user = $request->user();

        $query = Mouvement::with(['user']);

        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('date_mouvement', [
                $request->input('date_from'),
                $request->input('date_to')
            ]);
        }

        if ($request->has('plaque')) {
            $query->where('plaque', $request->input('plaque'));
        }

        if ($request->has('operation_type')) {
            $query->where('operation_type', $request->input('operation_type'));
        }

        $mouvements = $query->get();

        $summary = [
            'total_mouvements' => $mouvements->count(),
            'par_type' => $mouvements->groupBy('operation_type')->map->count(),
            'par_plaque' => $mouvements->groupBy('plaque')->map->count(),
            'plaques_uniques' => $mouvements->pluck('plaque')->unique()->count(),
        ];

        return response()->json([
            'summary' => $summary,
            'mouvements' => $mouvements,
        ]);
    }

    /**
     * Rapport des alertes
     */
    public function alertReport(Request $request)
    {
        $user = $request->user();

        $query = \App\Models\Alerte::with(['dossier', 'user']);

        // Alertes destinées à l'utilisateur ou son rôle
        $query->where(function($q) use ($user) {
            $q->where('recipient_id', $user->id)
              ->orWhere('target_role', $user->role);
        });

        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('created_at', [
                $request->input('date_from'),
                $request->input('date_to')
            ]);
        }

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->input('severity'));
        }

        $alertes = $query->get();

        $summary = [
            'total_alertes' => $alertes->count(),
            'par_type' => $alertes->groupBy('type')->map->count(),
            'par_severity' => $alertes->groupBy('severity')->map->count(),
            'non_lues' => $alertes->where('is_read', false)->count(),
        ];

        return response()->json([
            'summary' => $summary,
            'alertes' => $alertes,
        ]);
    }

    /**
     * Helper: Calculer le temps moyen
     */
    private function calculateAverageTime(Collection $items): float
    {
        if ($items->isEmpty()) {
            return 0;
        }

        $totalSeconds = $items->sum(function($item) {
            if ($item->created_at && $item->updated_at) {
                return $item->updated_at->diffInSeconds($item->created_at);
            }
            return 0;
        });

        $hours = $totalSeconds / 3600;
        return round($hours, 2);
    }
}
