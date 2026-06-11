<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Alerte;

class AlerteController extends Controller
{
    /**
     * Liste des alertes de l'utilisateur ou de son rôle
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Alerte::where(function ($query) use ($user) {
            $query->where('recipient_id', $user->id)
                  ->orWhere('target_role', $user->role);
        });

        if ($request->has('hierarchy_level')) {
            $query->where('hierarchy_level', $request->input('hierarchy_level'));
        }

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->input('severity'));
        }

        if ($request->has('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        if ($request->has('status')) {
            switch ($request->input('status')) {
                case 'nouvelle': $query->where('is_read', false)->whereNull('resolved_at'); break;
                case 'lue': $query->where('is_read', true)->whereNull('resolved_at'); break;
                case 'traitee': $query->where('is_read', true)->whereNotNull('resolved_at'); break;
                case 'rejetee': $query->where('type', 'like', '%rejet%'); break;
            }
        }

        $alertes = $query->orderBy('created_at', 'desc')
            ->with(['dossier', 'recipient', 'trigger'])
            ->get();

        return response()->json($alertes);
    }

    /**
     * Marquer une alerte comme lue
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        $alerte = Alerte::where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('recipient_id', $user->id)
                      ->orWhere('target_role', $user->role);
            })
            ->firstOrFail();

        $alerte->update([
            'is_read' => true,
            'acknowledged_at' => now(),
        ]);

        return response()->json([
            'message' => 'Alerte marquée comme lue avec succès.',
            'alerte' => $alerte
        ]);
    }

    /**
     * Marquer une alerte comme acquittée (acknowledge)
     */
    public function acknowledge(Request $request, $id)
    {
        $user = $request->user();

        $alerte = Alerte::where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('recipient_id', $user->id)
                      ->orWhere('target_role', $user->role);
            })
            ->firstOrFail();

        $alerte->update([
            'is_read' => true,
            'acknowledged_at' => now(),
        ]);

        return response()->json([
            'message' => 'Alerte acquittée.',
            'alerte' => $alerte
        ]);
    }

    /**
     * Résoudre une alerte
     */
    public function resolve(Request $request, $id)
    {
        $user = $request->user();

        $alerte = Alerte::where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('recipient_id', $user->id)
                      ->orWhere('target_role', $user->role);
            })
            ->firstOrFail();

        $alerte->update([
            'is_read' => true,
            'resolved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Alerte résolue.',
            'alerte' => $alerte
        ]);
    }

    /**
     * Obtenir les alertes non lues
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $count = Alerte::where(function ($query) use ($user) {
            $query->where('recipient_id', $user->id)
                  ->orWhere('target_role', $user->role);
        })
        ->where('is_read', false)
        ->count();

        return response()->json(['unread_count' => $count]);
    }

    /**
     * Obtenir les alertes critiques
     */
    public function critical(Request $request)
    {
        $user = $request->user();

        $alertes = Alerte::where(function ($query) use ($user) {
            $query->where('recipient_id', $user->id)
                  ->orWhere('target_role', $user->role);
        })
        ->where('severity', 'critical')
        ->whereNull('resolved_at')
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($alertes);
    }

    /**
     * Statistiques des alertes
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        $base = Alerte::where(function ($query) use ($user) {
            $query->where('recipient_id', $user->id)
                  ->orWhere('target_role', $user->role);
        });

        return response()->json([
            'nouvelles' => (clone $base)->where('is_read', false)->whereNull('resolved_at')->count(),
            'lues' => (clone $base)->where('is_read', true)->whereNull('resolved_at')->count(),
            'traitees' => (clone $base)->whereNotNull('resolved_at')->count(),
            'critiques' => (clone $base)->where('severity', 'critical')->whereNull('resolved_at')->count(),
            'elevees' => (clone $base)->where('severity', 'high')->whereNull('resolved_at')->count(),
            'moyennes' => (clone $base)->where('severity', 'medium')->whereNull('resolved_at')->count(),
        ]);
    }

    /**
     * Récupérer une alerte unique
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $alerte = Alerte::where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('recipient_id', $user->id)
                      ->orWhere('target_role', $user->role);
            })
            ->with(['dossier', 'recipient', 'trigger'])
            ->firstOrFail();

        return response()->json($alerte);
    }
}

