<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DossierControle;
use App\Models\BarriereControle;
use App\Models\DossierSignataire;
use App\Services\AlerteService;

class DossierControleController extends Controller
{
    protected $alerteService;

    public function __construct(AlerteService $alerteService)
    {
        $this->alerteService = $alerteService;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = DossierControle::with(['barriere:id,nom', 'brigadier:id,full_name', 'signataires']);

        // Brigadier ne voit que les dossiers de sa barrière
        if ($user->role === 'brigadier_controle') {
            $barriere = BarriereControle::where('brigadier_id', $user->id)->first();
            if (!$barriere) {
                return response()->json([]);
            }
            $query->where('barriere_id', $barriere->id);
        }

        // Filtres
        if ($request->has('date_debut') && $request->has('date_fin')) {
            $query->whereBetween('date_controle', [$request->date_debut, $request->date_fin]);
        }

        if ($request->has('nom_importateur')) {
            $query->where('nom_importateur', 'like', '%' . $request->nom_importateur . '%');
        }

        if ($request->has('reference_douane')) {
            $query->where('reference_douane', 'like', '%' . $request->reference_douane . '%');
        }

        if ($request->has('barriere_id')) {
            $query->where('barriere_id', $request->barriere_id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nom_importateur' => 'required|string|max:255',
            'plaque_avant' => 'nullable|string|max:50',
            'plaque_arriere' => 'nullable|string|max:50',
            'reference_douane' => 'required|string|max:255',
            'date_controle' => 'required|date',
            'reference_bon_sortie' => 'nullable|string|max:255',
            'balle' => 'nullable|string|max:255',
            'autorisation_speciale' => 'boolean',
            'type_autorisation' => 'required_if:autorisation_speciale,true|nullable|string|max:255',
            'reference_autorisation' => 'required_if:autorisation_speciale,true|nullable|string|max:255',
            'date_autorisation' => 'required_if:autorisation_speciale,true|nullable|date',
            'signataires' => 'nullable|array',
            'signataires.*' => 'string|max:255',
        ]);

        // Trouver la barrière du brigadier
        $barriere = BarriereControle::where('brigadier_id', $user->id)->first();
        if (!$barriere) {
            return response()->json(['message' => 'Aucune barrière de contrôle ne vous est affectée.'], 403);
        }

        $dossier = DossierControle::create([
            'barriere_id' => $barriere->id,
            'brigadier_id' => $user->id,
            'nom_importateur' => $request->nom_importateur,
            'plaque_avant' => $request->plaque_avant,
            'plaque_arriere' => $request->plaque_arriere,
            'reference_douane' => $request->reference_douane,
            'date_controle' => $request->date_controle,
            'reference_bon_sortie' => $request->reference_bon_sortie,
            'balle' => $request->balle,
            'autorisation_speciale' => $request->boolean('autorisation_speciale'),
            'type_autorisation' => $request->type_autorisation,
            'reference_autorisation' => $request->reference_autorisation,
            'date_autorisation' => $request->date_autorisation,
        ]);

        // Créer les signataires si autorisation spéciale
        if ($request->boolean('autorisation_speciale') && $request->has('signataires')) {
            foreach ($request->signataires as $type) {
                DossierSignataire::create([
                    'dossier_id' => $dossier->id,
                    'type_signataire' => $type,
                ]);
            }
        }

        // Alerter tous les inspecteurs chefs lorsqu'un brigadier active l'autorisation spéciale
        if ($request->boolean('autorisation_speciale')) {
            $this->alerteService->createRoleAlert(
                $request->reference_douane,
                'autorisation_speciale',
                '🚨 Autorisation spéciale sollicitée',
                "Le brigadier {$user->full_name} a sollicité une autorisation spéciale ({$request->type_autorisation}) pour le dossier {$request->reference_douane} contrôlé à la barrière {$barriere->nom}.",
                ['inspecteur_chef']
            );
        }

        return response()->json(
            $dossier->load(['barriere:id,nom', 'brigadier:id,full_name', 'signataires']),
            201
        );
    }

    public function show(Request $request, $id)
    {
        $dossier = DossierControle::with([
            'barriere:id,nom',
            'brigadier:id,full_name',
            'signataires',
        ])->findOrFail($id);

        $user = $request->user();
        if ($user->role === 'brigadier_controle') {
            $barriere = BarriereControle::where('brigadier_id', $user->id)->first();
            if (!$barriere || $dossier->barriere_id !== $barriere->id) {
                return response()->json(['message' => 'Non autorisé à consulter ce dossier.'], 403);
            }
        }

        return response()->json($dossier);
    }

    public function search(Request $request)
    {
        $request->validate(['q' => 'required|string|max:255']);

        $user = $request->user();
        $query = DossierControle::with(['barriere:id,nom', 'brigadier:id,full_name', 'signataires']);

        if ($user->role === 'brigadier_controle') {
            $barriere = BarriereControle::where('brigadier_id', $user->id)->first();
            if ($barriere) {
                $query->where('barriere_id', $barriere->id);
            }
        }

        $query->where('reference_douane', 'like', '%' . $request->q . '%')
            ->orWhere('nom_importateur', 'like', '%' . $request->q . '%');

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }
}
