<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Dossier;
use App\Models\ItEntry;
use App\Services\DossierTimelineService;

class ItEntryController extends Controller
{
    /**
     * Créer une nouvelle entrée IT (Inventory Transit).
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!in_array($user->role, ['typing_operator', 'chef_barriere', 'super_admin'])) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $validated = $request->validate([
            'reference_dra'     => 'nullable|string',
            'dossier_id'        => 'nullable|uuid|exists:dossiers,id',
            'consignee'         => 'nullable|string|max:255',
            'chassis'           => 'nullable|string|max:100',
            'vehicule_mark'     => 'nullable|string|max:100',
            'manifest_year'     => 'nullable|string|max:10',
            'color'             => 'nullable|string|max:50',
            'it_reference'      => 'nullable|string|max:100',
        ]);

        // Résoudre le dossier par DRA (E-XXX) si dossier_id absent
        $dossierId = $validated['dossier_id'] ?? null;
        if (!$dossierId && !empty($validated['reference_dra'])) {
            $dossierId = Dossier::where('dra', $validated['reference_dra'])->value('id');
        }

        $entry = ItEntry::create(array_merge(
            collect($validated)->except(['reference_dra', 'dossier_id'])->toArray(),
            [
                'dossier_id'         => $dossierId,
                'typing_operator_id' => $user->id,
                'status'             => $dossierId ? 'linked' : 'pending',
            ]
        ));

        if ($dossierId) {
            DossierTimelineService::log(
                $dossierId,
                $user->id,
                'IT_ENTRY_SAISIE',
                'barriere_etranger',
                "Entrée IT Module: {$entry->vehicule_mark} — châssis {$entry->chassis} saisi par {$user->full_name}."
            );
        }

        return response()->json([
            'message' => 'Entrée IT enregistrée.',
            'entry'   => $entry->load('dossier', 'typingOperator'),
        ], 201);
    }

    /**
     * Liste paginée des entrées IT avec recherche fulltext légère.
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = ItEntry::with(['dossier', 'typingOperator']);

        // Typing operator ne voit que ses propres entrées
        if ($user->role === 'typing_operator') {
            $query->where('typing_operator_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('it_reference', 'like', "%{$s}%")
                  ->orWhere('chassis', 'like', "%{$s}%")
                  ->orWhere('consignee', 'like', "%{$s}%")
                  ->orWhere('vehicule_mark', 'like', "%{$s}%");
            });
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->get()
        );
    }

    /**
     * Toutes les entrées IT liées à un dossier.
     */
    public function showByDossier(Request $request, string $dossierId): JsonResponse
    {
        Dossier::findOrFail($dossierId);

        return response()->json(
            ItEntry::with('typingOperator')
                ->where('dossier_id', $dossierId)
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }
}
