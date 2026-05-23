<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Mouvement;
use App\Models\TitreDocument;
use App\Models\Alerte;
use Illuminate\Support\Facades\DB;

class MouvementController extends Controller
{
    /**
     * Liste des mouvements de l'entrepôt
     */
    public function index(Request $request)
    {
        $query = Mouvement::with(['titreDocument', 'user']);

        if ($request->has('operation_type')) {
            $query->where('operation_type', $request->input('operation_type'));
        }

        if ($request->has('plaque')) {
            $query->where('plaque', 'LIKE', '%' . $request->input('plaque') . '%');
        }

        $mouvements = $query->orderBy('created_at', 'desc')->get();

        return response()->json($mouvements);
    }

    /**
     * Enregistrer un nouveau mouvement de véhicule
     */
    public function store(Request $request)
    {
        $request->validate([
            'operation_type' => 'required|string|in:entrant_charge,entrant_vide,sortant_charge,sortant_vide,vrac_sortant',
            'plaque' => 'required|string|max:50',
            'chauffeur' => 'nullable|string|max:255',
            'importateur' => 'nullable|string|max:255',
            'date_mouvement' => 'required|date',
            'sub_type_operation' => 'nullable|string|max:100',
            'empty_manifest' => 'nullable|string|max:100',
            'date_empty_manifest' => 'nullable|date',
            'custom_fields' => 'nullable|array',
            
            // Validation pour l'entrant chargé (Titres DRA & T1)
            'reference_dra' => 'required_if:operation_type,entrant_charge|string',
            'date_dra' => 'required_if:operation_type,entrant_charge|date',
            'reference_t1' => 'required_if:operation_type,entrant_charge|string',
            'date_t1' => 'required_if:operation_type,entrant_charge|date',
        ]);

        DB::beginTransaction();

        try {
            // Créer le mouvement de véhicule
            $mouvement = Mouvement::create([
                'operation_type' => $request->operation_type,
                'plaque' => $request->plaque,
                'chauffeur' => $request->chauffeur,
                'importateur' => $request->importateur,
                'date_mouvement' => $request->date_mouvement,
                'sub_type_operation' => $request->sub_type_operation,
                'empty_manifest' => $request->empty_manifest,
                'date_empty_manifest' => $request->date_empty_manifest,
                'custom_fields' => $request->custom_fields, // Contient les détails VRAC
                'user_id' => $request->user()->id,
            ]);

            // Si c'est un entrant chargé, enregistrer les titres associés
            if ($request->operation_type === 'entrant_charge') {
                TitreDocument::create([
                    'mouvement_id' => $mouvement->id,
                    'reference_dra' => $request->reference_dra,
                    'date_dra' => $request->date_dra,
                    'reference_t1' => $request->reference_t1,
                    'date_t1' => $request->date_t1,
                ]);
            }

            // Alerte pour notifier de l'entrée/sortie
            Alerte::create([
                'target_role' => 'chef_bureau',
                'type' => 'entree',
                'title' => 'Nouveau Mouvement Brigadier',
                'message' => "Un mouvement de type '{$mouvement->operation_type}' a été enregistré pour le véhicule {$mouvement->plaque} par " . $request->user()->full_name,
                'reference_id' => strval($mouvement->id),
            ]);

            DB::commit();

            return response()->json($mouvement->load('titreDocument'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de l\'enregistrement du mouvement.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Détails d'un mouvement
     */
    public function show($id)
    {
        $mouvement = Mouvement::with(['titreDocument', 'user'])->findOrFail($id);
        return response()->json($mouvement);
    }
}
