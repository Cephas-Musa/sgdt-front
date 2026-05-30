<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BarriereEntry;
use App\Models\Barriere;
use App\Models\BarrierRevenue;
use App\Models\Dossier;
use App\Models\Alerte;
use App\Models\Mouvement;
use App\Models\TypingDocDirect;
use App\Models\EmptyManifest;
use App\Services\AlerteService;
use App\Services\AuditLogService;
use App\Services\DossierTimelineService;
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

        $year = date('Y');
        $random = rand(100000, 999999);
        $reference = "BAR/{$year}/{$random}";

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

        $dossier = Dossier::find($request->input('dossier_id'));
        if ($dossier) {
            if ($entry->status === 'conforme') {
                $dossier->status = 'verifie';
            } elseif (in_array($entry->status, ['litige', 'suspect'])) {
                $dossier->status = 'rejete';

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

        DossierTimelineService::log(
            $entry->dossier_id,
            $agent->id,
            'BARRIERE_PASSAGE',
            'barriere',
            "Passage barrière {$entry->barriere_name}: {$entry->status}. Ref: {$reference}"
        );

        AuditLogService::log('barriere', 'create_entry', $entry->id, null, [
            'reference' => $reference,
            'barriere' => $entry->barriere_name,
            'status' => $entry->status,
        ]);

        return response()->json($entry->load('dossier'), 201);
    }

    // ─── BARRIERES (master) ───────────────────────────────────────────────────

    public function indexBarrieres(Request $request)
    {
        $query = Barriere::withCount('mouvements');

        if ($request->filled('province')) {
            $query->where('province', $request->input('province'));
        }

        if ($request->filled('pays')) {
            $query->where('pays', $request->input('pays'));
        }

        return response()->json($query->orderBy('nom')->get());
    }

    public function showBarriere(string $id)
    {
        $barriere = Barriere::with(['typingOperators', 'chefs', 'mouvements'])->findOrFail($id);
        return response()->json($barriere);
    }

    public function getBalance(string $id)
    {
        $barriere = Barriere::findOrFail($id);

        $totalRevenus = BarrierRevenue::where('barriere_code', $barriere->code)->sum('amount');
        $countDocs = TypingDocDirect::where('barriere_code', $barriere->code)->count();
        $countEmptyManifests = EmptyManifest::where('bureau_id', $barriere->id)->count();

        return response()->json([
            'barriere' => $barriere,
            'balance_financiere' => $barriere->balance_financiere,
            'total_revenus' => $totalRevenus,
            'documents_count' => $countDocs,
            'empty_manifests_count' => $countEmptyManifests,
            'devise' => 'USD',
        ]);
    }

    public function getMovements(string $id)
    {
        $barriere = Barriere::findOrFail($id);
        $entries = BarriereEntry::where('barriere_name', $barriere->nom)
            ->orWhere('barriere_name', $barriere->code)
            ->with('dossier')
            ->orderBy('date_passage', 'desc')
            ->get();

        return response()->json($entries);
    }

    public function recordEntry(Request $request, string $id)
    {
        $barriere = Barriere::findOrFail($id);
        $user = $request->user();

        $validated = $request->validate([
            'dossier_id' => 'nullable|uuid|exists:dossiers,id',
            'plaque' => 'required|string|max:50',
            'chauffeur' => 'nullable|string|max:255',
            'type_vehicule' => 'nullable|string|max:50',
            'marchandises' => 'nullable|string',
            'poids' => 'nullable|numeric|min:0',
            'observations' => 'nullable|string',
        ]);

        $entry = Mouvement::create([
            'dossier_id' => $validated['dossier_id'] ?? null,
            'barriere_id' => $id,
            'plaque' => $validated['plaque'],
            'chauffeur' => $validated['chauffeur'] ?? null,
            'type_vehicule' => $validated['type_vehicule'] ?? null,
            'marchandises' => $validated['marchandises'] ?? null,
            'poids' => $validated['poids'] ?? 0,
            'operation_type' => 'entree',
            'user_id' => $user->id,
            'observations' => $validated['observations'] ?? null,
            'date_operation' => now(),
        ]);

        AuditLogService::log('barriere', 'record_entry', $entry->id, null, [
            'barriere' => $barriere->nom,
            'plaque' => $validated['plaque'],
            'type' => 'entree',
        ]);

        return response()->json($entry->load('dossier'), 201);
    }

    public function recordExit(Request $request, string $id)
    {
        $barriere = Barriere::findOrFail($id);
        $user = $request->user();

        $validated = $request->validate([
            'dossier_id' => 'nullable|uuid|exists:dossiers,id',
            'plaque' => 'required|string|max:50',
            'chauffeur' => 'nullable|string|max:255',
            'observations' => 'nullable|string',
        ]);

        $entry = Mouvement::create([
            'dossier_id' => $validated['dossier_id'] ?? null,
            'barriere_id' => $id,
            'plaque' => $validated['plaque'],
            'chauffeur' => $validated['chauffeur'] ?? null,
            'operation_type' => 'sortie',
            'user_id' => $user->id,
            'observations' => $validated['observations'] ?? null,
            'date_operation' => now(),
        ]);

        AuditLogService::log('barriere', 'record_exit', $entry->id, null, [
            'barriere' => $barriere->nom,
            'plaque' => $validated['plaque'],
            'type' => 'sortie',
        ]);

        return response()->json($entry->load('dossier'), 201);
    }
}
