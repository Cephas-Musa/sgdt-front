<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Apurement;
use App\Models\Dossier;
use App\Models\Alerte;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ApurementController extends Controller
{
    /**
     * Display a listing of apurements based on role.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Apurement::with(['dossier', 'secretaire']);

        if ($user->role === 'secretaire_inspecteur') {
            // Secretary can see their own submissions
            $query->where('secretaire_id', $user->id);
        } elseif ($user->role === 'inspecteur_chef') {
            // Inspector chef can see submissions from their secretaries
            $secretaireIds = User::where('parent_id', $user->id)->pluck('id');
            $query->whereIn('secretaire_id', $secretaireIds);
        }

        return response()->json($query->orderBy('date_soumission', 'desc')->get());
    }

    /**
     * Submit a new apurement request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'dossier_id' => 'required|string|exists:dossiers,id',
            'ref_douane' => 'required|string|max:100',
            'date_apurement' => 'required|date',
        ]);

        $dossier = Dossier::findOrFail($request->input('dossier_id'));
        
        // Enforce that dossier is verified before clearance submission
        if ($dossier->status !== 'verifie') {
            return response()->json([
                'message' => 'Le dossier doit être vérifié avant de soumettre un apurement.'
            ], 400);
        }

        $secretaire = $request->user();

        // Prevent double submission
        if (Apurement::where('dossier_id', $dossier->id)->where('status', 'soumis')->exists()) {
            return response()->json([
                'message' => 'Un apurement est déjà en cours de traitement pour ce dossier.'
            ], 400);
        }

        $apurement = Apurement::create([
            'dossier_id' => $dossier->id,
            'secretaire_id' => $secretaire->id,
            'ref_douane' => $request->input('ref_douane'),
            'date_apurement' => $request->input('date_apurement'),
            'date_soumission' => now(),
            'status' => 'soumis',
        ]);

        // Notify Inspector Chef (parent_id)
        if ($secretaire->parent_id) {
            Alerte::create([
                'recipient_id' => $secretaire->parent_id,
                'type' => 'systeme',
                'title' => 'Nouvel Apurement Soumis',
                'message' => "Votre secrétaire {$secretaire->full_name} a soumis un apurement pour le dossier {$dossier->id}.",
                'reference_id' => $dossier->id,
            ]);
        }

        return response()->json($apurement->load('dossier'), 201);
    }

    /**
     * Validate or reject an apurement request.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:valide,rejete',
        ]);

        $apurement = Apurement::findOrFail($id);
        $dossier = Dossier::findOrFail($apurement->dossier_id);

        DB::beginTransaction();
        try {
            $apurement->status = $request->input('status');
            $apurement->save();

            if ($apurement->status === 'valide') {
                $dossier->status = 'apure';
                $dossier->save();

                // Create system alert that dossier is fully apuré
                Alerte::create([
                    'recipient_id' => $dossier->user_id, // Declarant/creator
                    'type' => 'systeme',
                    'title' => 'Dossier Apuré',
                    'message' => "Le dossier {$dossier->id} (Réf: {$dossier->reference}) a été apuré avec succès.",
                    'reference_id' => $dossier->id,
                ]);
            }

            // Notify Secretary
            Alerte::create([
                'recipient_id' => $apurement->secretaire_id,
                'type' => 'systeme',
                'title' => "Apurement " . ($apurement->status === 'valide' ? 'Validé' : 'Rejeté'),
                'message' => "L'apurement pour le dossier {$dossier->id} a été " . ($apurement->status === 'valide' ? 'validé' : 'rejeté') . ".",
                'reference_id' => $dossier->id,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Apurement mis à jour avec succès.',
                'apurement' => $apurement,
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
