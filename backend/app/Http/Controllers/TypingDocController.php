<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Dossier;
use App\Models\TypingDocDirect;
use App\Models\TypingDocTranshipment;
use App\Services\DossierTimelineService;

class TypingDocController extends Controller
{
    /**
     * Vérifie que l'utilisateur est typing_operator, chef_barriere ou super_admin.
     */
    private function requireTypingOperator(Request $request): \App\Models\User
    {
        $user = $request->user();
        if (!in_array($user->role, ['typing_operator', 'chef_barriere', 'super_admin'])) {
            abort(403, 'Non autorisé. Typing Operator requis.');
        }
        return $user;
    }

    /**
     * Résout un dossier_id à partir de dossier_reference si dossier_id absent.
     */
    private function resolveDossierId(?string $dossierId, ?string $dossierReference): ?string
    {
        if ($dossierId) {
            return $dossierId;
        }
        if ($dossierReference) {
            return Dossier::where('reference', $dossierReference)->value('id');
        }
        return null;
    }

    /**
     * Créer un document direct (passage direct barrière étrangère).
     */
    public function storeDirect(Request $request): JsonResponse
    {
        $user = $this->requireTypingOperator($request);

        $validated = $request->validate([
            'dossier_reference'  => 'nullable|string',
            'dossier_id'         => 'nullable|uuid|exists:dossiers,id',
            'barriere_code'      => 'required|string|max:50',
            'office'             => 'nullable|string|max:100',
            'entree_reference'   => 'nullable|string|max:100',
            'date_entree'        => 'nullable|date',
            't1_reference'       => 'nullable|string|max:100',
            't1_date'            => 'nullable|date',
            'consignee'          => 'nullable|string|max:255',
            'country_of_export'  => 'nullable|string|max:100',
            'vehicule_reference' => 'nullable|string|max:100',
            'container_number'   => 'nullable|string|max:100',
            'container_20'       => 'nullable|integer|min:0',
            'container_40'       => 'nullable|integer|min:0',
            'notes'              => 'nullable|string',
        ]);

        $dossierId = $this->resolveDossierId(
            $validated['dossier_id'] ?? null,
            $validated['dossier_reference'] ?? null
        );

        $doc = TypingDocDirect::create(array_merge(
            collect($validated)->except(['dossier_reference', 'dossier_id'])->toArray(),
            [
                'dossier_id'          => $dossierId,
                'typing_operator_id'  => $user->id,
                'status'              => $dossierId ? 'linked' : 'pending',
            ]
        ));

        if ($dossierId) {
            DossierTimelineService::log(
                $dossierId,
                $user->id,
                'TYPING_DOC_DIRECT_SAISI',
                'barriere_etranger',
                "Document direct barrière {$validated['barriere_code']} saisi par {$user->full_name}."
            );
        }

        return response()->json([
            'message' => 'Document direct enregistré.',
            'doc'     => $doc->load('dossier', 'typingOperator'),
        ], 201);
    }

    /**
     * Créer un document de transbordement (transhipment).
     */
    public function storeTranshipment(Request $request): JsonResponse
    {
        $user = $this->requireTypingOperator($request);

        $validated = $request->validate([
            'dossier_reference'  => 'nullable|string',
            'dossier_id'         => 'nullable|uuid|exists:dossiers,id',
            'nombre_vehicules'   => 'nullable|integer|min:1',
            'transhipped_to'     => 'nullable|string|max:255',
            'vehicule_reference' => 'nullable|string|max:100',
            'container_number'   => 'nullable|string|max:100',
            'document_reference' => 'nullable|string|max:100',
            'date_doc'           => 'nullable|date',
            'notes'              => 'nullable|string',
        ]);

        $dossierId = $this->resolveDossierId(
            $validated['dossier_id'] ?? null,
            $validated['dossier_reference'] ?? null
        );

        $doc = TypingDocTranshipment::create(array_merge(
            collect($validated)->except(['dossier_reference', 'dossier_id'])->toArray(),
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
                'TYPING_DOC_TRANSHIPMENT_SAISI',
                'barriere_etranger',
                "Document transbordement saisi par {$user->full_name}. Véhicules: {$doc->nombre_vehicules}."
            );
        }

        return response()->json([
            'message' => 'Document transbordement enregistré.',
            'doc'     => $doc->load('dossier', 'typingOperator'),
        ], 201);
    }

    /**
     * Tous les docs directs et transbordement d'un dossier.
     */
    public function indexByDossier(Request $request, string $dossierId): JsonResponse
    {
        Dossier::findOrFail($dossierId);

        return response()->json([
            'direct'       => TypingDocDirect::with('typingOperator')
                ->where('dossier_id', $dossierId)
                ->orderBy('created_at', 'desc')
                ->get(),
            'transhipment' => TypingDocTranshipment::with('typingOperator')
                ->where('dossier_id', $dossierId)
                ->orderBy('created_at', 'desc')
                ->get(),
        ]);
    }

    /**
     * Lier un document non-lié à un dossier par référence.
     */
    public function linkToDossier(Request $request, string $docId): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'dossier_reference' => 'required|string|exists:dossiers,reference',
            'doc_type'          => 'required|in:direct,transhipment',
        ]);

        $dossier = Dossier::where('reference', $validated['dossier_reference'])->firstOrFail();

        if ($validated['doc_type'] === 'direct') {
            $doc = TypingDocDirect::findOrFail($docId);
        } else {
            $doc = TypingDocTranshipment::findOrFail($docId);
        }

        $doc->update(['dossier_id' => $dossier->id, 'status' => 'linked']);

        DossierTimelineService::log(
            $dossier->id,
            $user->id,
            'TYPING_DOC_LIE',
            'barriere_etranger',
            "Document {$validated['doc_type']} #{$docId} lié au dossier par {$user->full_name}."
        );

        return response()->json([
            'message' => 'Document lié au dossier.',
            'dossier' => $dossier->reference,
        ]);
    }

    /**
     * Stats pour dashboard Chef Barrière / Typing Operator.
     */
    public function getDashboardStats(Request $request): JsonResponse
    {
        $user          = $request->user();
        $barriere_code = $request->input('barriere_code');

        $directQuery   = TypingDocDirect::query();
        $transhipQuery = TypingDocTranshipment::query();

        // Typing operator ne voit que ses propres docs
        if ($user->role === 'typing_operator') {
            $directQuery->where('typing_operator_id', $user->id);
            $transhipQuery->where('typing_operator_id', $user->id);
        }

        if ($barriere_code) {
            $directQuery->where('barriere_code', $barriere_code);
        }

        $today = now()->toDateString();

        return response()->json([
            'direct_today'   => (clone $directQuery)->whereDate('created_at', $today)->count(),
            'direct_total'   => (clone $directQuery)->count(),
            'direct_pending' => (clone $directQuery)->where('status', 'pending')->count(),
            'tranship_today' => (clone $transhipQuery)->whereDate('created_at', $today)->count(),
            'tranship_total' => (clone $transhipQuery)->count(),
            'pending_docs'   => TypingDocDirect::where('status', 'pending')
                ->when($barriere_code, fn ($q) => $q->where('barriere_code', $barriere_code))
                ->when($user->role === 'typing_operator', fn ($q) => $q->where('typing_operator_id', $user->id))
                ->count(),
        ]);
    }
}
