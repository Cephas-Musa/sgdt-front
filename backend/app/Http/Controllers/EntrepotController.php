<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Batiment;
use App\Models\EspaceStockage;
use App\Models\Entrepot;
use App\Models\Denombrement;
use App\Models\Decharge;
use App\Models\MouvementStockage;
use App\Services\AlerteService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class EntrepotController extends Controller
{
    protected $alerteService;

    public function __construct(AlerteService $alerteService)
    {
        $this->alerteService = $alerteService;
    }
    // --- Batiment CRUD ---

    public function indexBatiments()
    {
        return response()->json(Batiment::with('espaces')->get());
    }

    public function showBatiment($id)
    {
        return response()->json(Batiment::with('espaces')->findOrFail($id));
    }

    public function storeBatiment(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'entrepot_id' => 'nullable|integer',
        ]);

        $batiment = Batiment::create($request->all());
        return response()->json($batiment, 201);
    }

    public function updateBatiment(Request $request, $id)
    {
        $batiment = Batiment::findOrFail($id);

        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'entrepot_id' => 'nullable|integer',
        ]);

        $batiment->update($request->all());
        return response()->json($batiment);
    }

    public function destroyBatiment($id)
    {
        $batiment = Batiment::findOrFail($id);
        $batiment->delete();
        return response()->json(['message' => 'Bâtiment supprimé avec succès.']);
    }

    // --- EspaceStockage CRUD ---

    public function indexEspaces()
    {
        return response()->json(EspaceStockage::with('batiment')->get());
    }

    public function showEspace($id)
    {
        return response()->json(EspaceStockage::with('batiment')->findOrFail($id));
    }

    public function storeEspace(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'capacite' => 'required|numeric',
            'occupe' => 'nullable|numeric',
            'status' => 'required|string|max:50',
            'batiment_id' => 'required|exists:batiments,id',
        ]);

        $espace = EspaceStockage::create($request->all());
        return response()->json($espace, 201);
    }

    public function updateEspace(Request $request, $id)
    {
        $espace = EspaceStockage::findOrFail($id);

        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'capacite' => 'sometimes|required|numeric',
            'occupe' => 'nullable|numeric',
            'status' => 'sometimes|required|string|max:50',
            'batiment_id' => 'sometimes|required|exists:batiments,id',
        ]);

        $espace->update($request->all());
        return response()->json($espace);
    }

    public function destroyEspace($id)
    {
        $espace = EspaceStockage::findOrFail($id);
        $espace->delete();
        return response()->json(['message' => 'Espace de stockage supprimé avec succès.']);
    }

    // ────────── NOUVELLES MÉTHODES ──────────

    /**
     * Liste des entrepôts avec filtrage par rôle
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Entrepot::query();

        if (in_array($user->role, ['chef_entrepot_douane', 'chef_entrepot_prive'])) {
            $query->where('id', $user->entrepot_id);
        } elseif (in_array($user->role, ['inspecteur_chef_bureau', 'inspecteur'])) {
            $query->where('bureau', $user->bureau);
        }

        return response()->json($query->get());
    }

    /**
     * Détails d'un entrepôt
     */
    public function show(Request $request, $id)
    {
        $entrepot = Entrepot::findOrFail($id);
        return response()->json($entrepot);
    }

    /**
     * Création d'un entrepôt
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'bureau' => 'required|string|max:100',
            'capacite' => 'nullable|integer',
        ]);

        $entrepot = Entrepot::create([
            'id' => (string) Str::uuid(),
            'code' => $request->code,
            'nom' => $request->nom,
            'bureau' => $request->bureau,
            'capacite' => $request->capacite ?? 0,
        ]);

        return response()->json($entrepot, 201);
    }

    /**
     * Mise à jour d'un entrepôt
     */
    public function update(Request $request, $id)
    {
        $entrepot = Entrepot::findOrFail($id);

        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50',
            'bureau' => 'sometimes|required|string|max:100',
            'capacite' => 'nullable|integer',
        ]);

        $entrepot->update($request->only(['nom', 'code', 'bureau', 'capacite']));

        return response()->json($entrepot);
    }

    /**
     * Suppression d'un entrepôt
     */
    public function destroy($id)
    {
        $entrepot = Entrepot::findOrFail($id);
        $entrepot->delete();

        return response()->json(['message' => 'Entrepôt supprimé avec succès.']);
    }

    /**
     * Mouvements d'un entrepôt
     */
    public function movements(Request $request, $id)
    {
        $query = MouvementStockage::where('entrepot_id', $id);

        if ($request->has('type_mouvement')) {
            $query->where('type_mouvement', $request->input('type_mouvement'));
        }

        return response()->json($query->orderBy('date_mouvement', 'desc')->with(['user'])->get());
    }

    /**
     * Créer un dénombrement
     */
    public function createDenumbrement(Request $request, $id)
    {
        $request->validate([
            'reference' => 'required|string|unique:denombrements,reference',
            'date_denombrement' => 'required|date',
            'quantite_theorique' => 'required|integer|min:0',
        ]);

        $denombrement = Denombrement::create([
            'reference' => $request->reference,
            'entrepot_id' => $id,
            'date_denombrement' => $request->date_denombrement,
            'quantite_theorique' => $request->quantite_theorique,
            'status' => 'planifie',
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Dénombrement créé.', 'denombrement' => $denombrement], 201);
    }

    /**
     * Lister les dénombrements d'un entrepôt
     */
    public function getDenumbrements(Request $request, $id)
    {
        $query = Denombrement::where('entrepot_id', $id);

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Créer une décharge
     */
    public function createDecharge(Request $request, $id)
    {
        $request->validate([
            'reference' => 'required|string|unique:dechargements,reference',
            'dossier_id' => 'nullable|string',
            'quantite_attendue' => 'required|integer|min:0',
        ]);

        $decharge = Decharge::create([
            'reference' => $request->reference,
            'entrepot_id' => $id,
            'dossier_id' => $request->dossier_id,
            'quantite_attendue' => $request->quantite_attendue,
            'status' => 'planifie',
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Décharge créée.', 'decharge' => $decharge], 201);
    }

    /**
     * Mettre à jour une décharge
     */
    public function updateDecharge(Request $request, $id, $dechargeId)
    {
        $decharge = Decharge::where('id', $dechargeId)
            ->where('entrepot_id', $id)
            ->firstOrFail();

        $request->validate([
            'status' => 'required|in:planifie,en_cours,termine',
            'quantite_reelle' => 'nullable|integer|min:0',
        ]);

        $decharge->update([
            'status' => $request->status,
            'quantite_reelle' => $request->quantite_reelle ?? $decharge->quantite_reelle,
            'date_decharge' => $request->status === 'termine' ? now() : $decharge->date_decharge,
        ]);

        return response()->json(['message' => 'Décharge mise à jour.', 'decharge' => $decharge]);
    }
}
