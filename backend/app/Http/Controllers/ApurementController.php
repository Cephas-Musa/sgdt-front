<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Apurement;
use App\Models\Dossier;
use App\Models\Alerte;
use App\Models\User;
use App\Services\DossierTimelineService;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\DB;

class ApurementController extends Controller
{
    /**
     * Lister les apurements selon le rôle.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Apurement::with(['dossier', 'submitter', 'secretaire', 'validator']);

        if ($user->role === 'secretaire_inspecteur') {
            $query->where('secretaire_id', $user->id)
                  ->orWhere('user_id', $user->id);
        } elseif (in_array($user->role, ['inspecteur_chef'])) {
            $secretaireIds = User::where('parent_id', $user->id)->pluck('id');
            $query->where(function($q) use ($user, $secretaireIds) {
                $q->whereIn('secretaire_id', $secretaireIds);
                $q->orWhere('user_id', $user->id);
                $q->orWhereHas('dossier', function($dq) use ($user) {
                    $dq->where('inspecteur_id', $user->id)
                       ->orWhere('bureau_id', $user->bureau_id)
                       ->orWhere('created_by', $user->id);
                });
            });
        } elseif ($user->role === 'directeur_provincial') {
            if ($user->province_id) {
                $query->whereHas('dossier', function($dq) use ($user) {
                    $dq->where('province_id', $user->province_id);
                });
            }
        } elseif ($user->role === 'verificateur') {
            $query->where('user_id', $user->id)
                  ->orWhereHas('dossier', function($dq) use ($user) {
                      $dq->where('bureau_id', $user->bureau_id);
                  });
        }

        return response()->json($query->orderBy('date_soumission', 'desc')->get());
    }

    /**
     * Secrétaire / Inspecteur : soumettre un apurement (type: administratif).
     */
    public function store(Request $request)
    {
        $request->validate([
            'dossier_id' => 'required|string|exists:dossiers,id',
            'ref_douane' => 'required|string|max:100',
            'date_reference_douane' => 'nullable|date',
            'dra' => 'nullable|string|max:100',
            'dra_date' => 'nullable|date',
            'date_apurement' => 'required|date',
            't1' => 'nullable|string|max:100',
            't1_date' => 'nullable|date',
            'plaque_avant' => 'nullable|string|max:50',
            'plaque_arriere' => 'nullable|string|max:50',
            'observation' => 'nullable|string',
        ]);

        $dossier = Dossier::findOrFail($request->input('dossier_id'));

        if (Apurement::where('dossier_id', $dossier->id)->where('status', 'soumis')->exists()) {
            return response()->json([
                'message' => 'Un apurement est déjà en cours de traitement pour ce dossier.'
            ], 400);
        }

        $user = $request->user();

        // Marquer le dossier comme vérifié pour l'apurement
        if ($dossier->status !== 'verifie') {
            $dossier->status = 'verifie';
            $dossier->save();
        }

        $apurement = Apurement::create([
            'dossier_id' => $dossier->id,
            'user_id' => $user->id,
            'secretaire_id' => $user->role === 'secretaire_inspecteur' ? $user->id : null,
            'type_appurement' => 'administratif',
            'ref_douane' => $request->input('ref_douane'),
            'date_reference_douane' => $request->input('date_reference_douane'),
            'date_apurement' => $request->input('date_apurement'),
            'date_soumission' => now(),
            'dra' => $request->input('dra'),
            'dra_date' => $request->input('dra_date'),
            't1' => $request->input('t1'),
            't1_date' => $request->input('t1_date'),
            'plaque_avant' => $request->input('plaque_avant'),
            'plaque_arriere' => $request->input('plaque_arriere'),
            'observation' => $request->input('observation'),
            'status' => 'soumis',
        ]);

        if ($user->parent_id) {
            Alerte::create([
                'recipient_id' => $user->parent_id,
                'type' => 'systeme',
                'title' => 'Nouvel Apurement Soumis',
                'message' => "{$user->full_name} a soumis un apurement pour le dossier {$dossier->reference}.",
                'reference_id' => $dossier->id,
            ]);
        }

        DossierTimelineService::log(
            $dossier->id, $user->id,
            'APPUREMENT_SOUMIS', 'apurement',
            "Apurement soumis (type: administratif) — Réf douane: {$request->input('ref_douane')}"
        );

        return response()->json($apurement->load(['dossier', 'submitter', 'secretaire']), 201);
    }

    /**
     * Vérificateur : soumettre un apurement (type: verification).
     */
    public function storeVerificateur(Request $request)
    {
        $request->validate([
            'dossier_id' => 'required|string|exists:dossiers,id',
            'ref_douane' => 'required|string|max:100',
            'date_reference_douane' => 'nullable|date',
            'dra' => 'nullable|string|max:100',
            'dra_date' => 'nullable|date',
            'date_apurement' => 'required|date',
            't1' => 'nullable|string|max:100',
            'plaque_avant' => 'nullable|string|max:50',
            'plaque_arriere' => 'nullable|string|max:50',
            'quantite_totale' => 'nullable|numeric',
            'poids' => 'nullable|numeric',
            'information' => 'nullable|string',
            'observation' => 'nullable|string',
        ]);

        $dossier = Dossier::findOrFail($request->input('dossier_id'));

        if ($dossier->status === 'apure') {
            return response()->json([
                'message' => 'Le dossier est déjà apuré.'
            ], 400);
        }

        if (Apurement::where('dossier_id', $dossier->id)->where('status', 'soumis')->exists()) {
            return response()->json([
                'message' => 'Un apurement est déjà en cours de traitement pour ce dossier.'
            ], 400);
        }

        $user = $request->user();

        // Le vérificateur marque le dossier comme vérifié
        if ($dossier->status !== 'verifie') {
            $dossier->status = 'verifie';
            $dossier->save();
        }

        $apurement = Apurement::create([
            'dossier_id' => $dossier->id,
            'user_id' => $user->id,
            'secretaire_id' => null,
            'type_appurement' => 'verification',
            'ref_douane' => $request->input('ref_douane'),
            'date_reference_douane' => $request->input('date_reference_douane'),
            'date_apurement' => $request->input('date_apurement'),
            'date_soumission' => now(),
            'dra' => $request->input('dra'),
            'dra_date' => $request->input('dra_date'),
            't1' => $request->input('t1'),
            'plaque_avant' => $request->input('plaque_avant'),
            'plaque_arriere' => $request->input('plaque_arriere'),
            'observation' => $request->input('observation'),
            'status' => 'soumis',
        ]);

        // Store extra verification data in dossier.extra_data
        $extra = $dossier->extra_data ?? [];
        $extra['verification_apurement'] = [
            'quantite_totale' => $request->input('quantite_totale'),
            'poids' => $request->input('poids'),
            'information' => $request->input('information'),
            'submitted_by' => $user->id,
            'submitted_at' => now()->toDateTimeString(),
        ];
        $dossier->extra_data = $extra;
        $dossier->save();

        DossierTimelineService::log(
            $dossier->id, $user->id,
            'APPUREMENT_VERIFICATEUR_SOUMIS', 'apurement',
            "Apurement vérificateur soumis (type: verification) — Réf douane: {$request->input('ref_douane')}"
        );

        AuditLogService::log('apurement_verificateur', 'create', $apurement->id, null, [
            'dossier_id' => $dossier->id,
            'ref_douane' => $request->input('ref_douane'),
        ]);

        return response()->json($apurement->load(['dossier', 'submitter']), 201);
    }

    /**
     * Valider ou rejeter un apurement.
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();

        if (!in_array($user->role, [
            'super_admin', 'inspecteur_chef',
            'secretaire_inspecteur', 'directeur_provincial', 'verificateur'
        ])) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $request->validate([
            'status' => 'required|string|in:valide,rejete',
            'observation' => 'nullable|string',
        ]);

        $apurement = Apurement::findOrFail($id);
        $dossier = Dossier::findOrFail($apurement->dossier_id);

        DB::beginTransaction();
        try {
            $apurement->status = $request->input('status');
            $apurement->validated_by = $user->id;
            $apurement->validated_at = now();
            $apurement->observation = $request->input('observation', $apurement->observation);
            $apurement->save();

            if ($apurement->status === 'valide') {
                $dossier->status = 'apure';
                $dossier->save();

                Alerte::create([
                    'recipient_id' => $dossier->user_id ?? $dossier->created_by,
                    'type' => 'systeme',
                    'title' => 'Dossier Apuré',
                    'message' => "Le dossier {$dossier->reference} a été apuré avec succès.",
                    'reference_id' => $dossier->id,
                ]);
            } elseif ($apurement->status === 'rejete' && $apurement->type_appurement === 'verification') {
                // Rejet d'un apurement vérificateur → remettre le dossier disponible pour apurement direct
                if ($dossier->status !== 'en_cours') {
                    $dossier->status = 'en_cours';
                    $dossier->save();
                }
            }

            $notifyUserId = $apurement->secretaire_id ?? $apurement->user_id;
            if ($notifyUserId) {
                Alerte::create([
                    'recipient_id' => $notifyUserId,
                    'type' => 'systeme',
                    'title' => "Apurement " . ($apurement->status === 'valide' ? 'Validé' : 'Rejeté'),
                    'message' => "L'apurement pour le dossier {$dossier->reference} a été " .
                        ($apurement->status === 'valide' ? 'validé' : 'rejeté') . " par {$user->full_name}.",
                    'reference_id' => $dossier->id,
                ]);
            }

            $eventName = $apurement->status === 'valide' ? 'APPUREMENT_VALIDE' : 'APPUREMENT_REJETE';
            DossierTimelineService::log(
                $dossier->id, $user->id, $eventName, 'apurement',
                "Apurement {$apurement->status} par {$user->full_name}"
            );

            AuditLogService::log('apurement', 'update_status', $apurement->id, null, [
                'new_status' => $apurement->status,
                'validated_by' => $user->id,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Apurement mis à jour avec succès.',
                'apurement' => $apurement->load(['dossier', 'submitter', 'secretaire', 'validator']),
                'dossier_status' => $dossier->status
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de l\'apurement.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
