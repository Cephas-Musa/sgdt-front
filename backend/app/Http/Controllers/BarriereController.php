<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BarriereEntry;
use App\Models\Barriere;
use App\Models\Dossier;
use App\Models\Alerte;
use App\Models\Mouvement;
use App\Services\AlerteService;
use Illuminate\Support\Str;

class BarriereController extends Controller
{
    protected $alerteService;

    public function __construct(AlerteService $alerteService)
    {
        $this->alerteService = $alerteService;
    }
    /**
     * Display a listing of barrier entries.
     */
    public function index(Request $request)
    {
        $query = BarriereEntry::with(['dossier', 'agent']);

        if ($request->has('barriere_name')) {
            $query->where('barriere_name', $request->input('barriere_name'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('dossier_id')) {
            $query->where('dossier_id', $request->input('dossier_id'));
        }

        $entries = $query->orderBy('date_passage', 'desc')->get();

        return response()->json($entries);
    }

    /**
     * Store a newly created barrier entry in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'dossier_id' => 'required|string|exists:dossiers,id',
            'barriere_name' => 'required|string|max:100',
            'status' => 'required|string|in:conforme,litige,suspect',
            'observations' => 'nullable|string',
            'date_passage' => 'nullable|date',
        ]);

        $agent = $request->user();

        // Generate unique reference
        $year = date('Y');
        $random = rand(100000, 999999);
        $reference = "BAR/{$year}/{$random}";

        // Ensure uniqueness of reference
        while (BarriereEntry::where('reference_passage', $reference)->exists()) {
            $random = rand(100000, 999999);
            $reference = "BAR/{$year}/{$random}";
        }

        $entry = BarriereEntry::create([
            'reference_passage' => $reference,
            'dossier_id' => $request->input('dossier_id'),
            'barriere_name' => $request->input('barriere_name'),
            'agent_id' => $agent->id,
            'date_passage' => $request->input('date_passage') ?? now(),
            'status' => $request->input('status'),
            'observations' => $request->input('observations'),
        ]);

        // Update dossier status if necessary
        $dossier = Dossier::find($request->input('dossier_id'));
        if ($dossier) {
            if ($entry->status === 'conforme') {
                $dossier->status = 'verifie';
            } elseif (in_array($entry->status, ['litige', 'suspect'])) {
                $dossier->status = 'rejete'; // or 'suspendu'

                Alerte::create([
                    'target_role' => 'inspecteur_chef',
                    'type' => 'alerte',
                    'title' => "Incident à la barrière {$entry->barriere_name}",
                    'message' => "Un passage à la barrière {$entry->barriere_name} a été marqué comme '{$entry->status}' pour le dossier {$entry->dossier_id}. Obs: {$entry->observations}",
                    'reference_id' => $entry->dossier_id,
                ]);
            }
            $dossier->save();
        }

        return response()->json($entry->load('dossier'), 201);
    }
}
