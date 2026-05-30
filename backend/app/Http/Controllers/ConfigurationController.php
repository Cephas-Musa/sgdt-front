<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pays;
use App\Models\Devise;
use App\Models\BureauDouanier;
use App\Models\BureauRepresentation;
use App\Models\DirectionProvinciale;
use App\Models\Locode;
use App\Models\Entrepot;
use App\Models\TypeDossier;
use App\Models\RepresentationEntryPoint;
use App\Models\RepresentationExitPoint;

class ConfigurationController extends Controller
{
    public function getCountries()
    {
        return response()->json(Pays::orderBy('designation')->get());
    }


    public function storeCountry(Request $request) {
        $v = $request->validate([
            'id' => 'required|string|unique:pays,id',
            'code' => 'required|string',
            'designation' => 'required|string',
        ]);
        return response()->json(\App\Models\Pays::create($v), 201);
    }
    public function updateCountry(Request $request, $id) {
        $p = \App\Models\Pays::findOrFail($id);
        $v = $request->validate([
            'code' => 'sometimes|string',
            'designation' => 'sometimes|string',
        ]);
        $p->update($v);
        return response()->json($p);
    }
    public function destroyCountry($id) {
        \App\Models\Pays::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function getCurrencies()
    {
        return response()->json(Devise::all());
    }


    public function storeCurrency(Request $request) {
        $v = $request->validate([
            'id' => 'required|string|unique:devises,id',
            'code_pays' => 'required|string',
            'code_devise' => 'required|string',
            'denomination' => 'required|string',
        ]);
        return response()->json(\App\Models\Devise::create($v), 201);
    }
    public function updateCurrency(Request $request, $id) {
        $d = \App\Models\Devise::findOrFail($id);
        $v = $request->validate([
            'code_pays' => 'sometimes|string',
            'code_devise' => 'sometimes|string',
            'denomination' => 'sometimes|string',
        ]);
        $d->update($v);
        return response()->json($d);
    }
    public function destroyCurrency($id) {
        \App\Models\Devise::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function getCustomsOffices()
    {
        return response()->json(BureauDouanier::orderBy('denomination')->get());
    }

    public function storeCustomsOffice(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:bureaux_douaniers,id',
            'code' => 'required|string',
            'denomination' => 'required|string',
            'icb' => 'nullable|string',
            'province' => 'required|string',
            'manifest_price' => 'nullable|numeric',
        ]);
        $bureau = BureauDouanier::create($validated);
        return response()->json($bureau, 201);
    }

    public function updateCustomsOffice(Request $request, $id)
    {
        $bureau = BureauDouanier::findOrFail($id);
        $bureau->update($request->all());
        return response()->json($bureau);
    }

    public function destroyCustomsOffice($id)
    {
        BureauDouanier::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function getRepresentationOffices()
    {
        return response()->json(BureauRepresentation::orderBy('denomination')->get());
    }

    public function storeRepresentationOffice(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:bureau_representations,id',
            'code' => 'required|string',
            'denomination' => 'required|string',
            'type' => 'required|string',
            'ville' => 'nullable|string',
            'pays' => 'nullable|string',
            'status' => 'nullable|string',
        ]);
        $bureau = BureauRepresentation::create($validated);
        return response()->json($bureau, 201);
    }

    public function updateRepresentationOffice(Request $request, $id)
    {
        $bureau = BureauRepresentation::findOrFail($id);
        $bureau->update($request->all());
        return response()->json($bureau);
    }

    public function destroyRepresentationOffice($id)
    {
        BureauRepresentation::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function getProvincialDirections()
    {
        return response()->json(DirectionProvinciale::orderBy('denomination')->get());
    }

    public function storeProvincialDirection(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:directions_provinciales,id',
            'numero' => 'nullable|integer',
            'denomination' => 'required|string',
            'nombre_bureaux' => 'nullable|integer',
            'directeur' => 'nullable|string|unique:directions_provinciales,directeur',
            'telephone' => 'nullable|string',
            'email' => 'nullable|string',
        ], [
            'directeur.unique' => 'Ce Directeur Provincial est déjà assigné à une autre province.',
        ]);

        if (empty($validated['numero'])) {
            $validated['numero'] = (DirectionProvinciale::max('numero') ?? 0) + 1;
        }

        $dir = DirectionProvinciale::create($validated);
        return response()->json($dir, 201);
    }

    public function updateProvincialDirection(Request $request, $id)
    {
        $dir = DirectionProvinciale::findOrFail($id);
        $request->validate([
            'directeur' => 'nullable|string|unique:directions_provinciales,directeur,' . $id,
        ], [
            'directeur.unique' => 'Ce Directeur Provincial est déjà assigné à une autre province.',
        ]);
        $dir->update($request->all());
        return response()->json($dir);
    }

    public function destroyProvincialDirection($id)
    {
        DirectionProvinciale::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function getLocodes()
    {
        return response()->json(Locode::orderBy('designation')->get());
    }


    public function storeLocode(Request $request) {
        $v = $request->validate([
            'id' => 'required|string|unique:locodes,id',
            'code' => 'required|string',
            'designation' => 'required|string',
            'code_pays' => 'required|string',
            'denomination' => 'required|string',
        ]);
        return response()->json(\App\Models\Locode::create($v), 201);
    }
    public function updateLocode(Request $request, $id) {
        $l = \App\Models\Locode::findOrFail($id);
        $v = $request->validate([
            'code' => 'sometimes|string',
            'designation' => 'sometimes|string',
            'code_pays' => 'sometimes|string',
            'denomination' => 'sometimes|string',
        ]);
        $l->update($v);
        return response()->json($l);
    }
    public function destroyLocode($id) {
        \App\Models\Locode::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function getWarehouses()
    {
        return response()->json(Entrepot::orderBy('nom')->get());
    }

    public function storeWarehouse(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:entrepots,id',
            'code' => 'required|string',
            'nom' => 'required|string',
            'bureau' => 'required|string',
            'capacite' => 'nullable|integer',
        ]);
        $entrepot = Entrepot::create($validated);
        return response()->json($entrepot, 201);
    }

    public function updateWarehouse(Request $request, $id)
    {
        $entrepot = Entrepot::findOrFail($id);
        $entrepot->update($request->all());
        return response()->json($entrepot);
    }

    public function destroyWarehouse($id)
    {
        Entrepot::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function getTypesDossiers()
    {
        return response()->json(TypeDossier::orderBy('libelle')->get());
    }

    public function storeTypeDossier(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:types_dossiers,id',
            'code' => 'required|string|unique:types_dossiers,code',
            'libelle' => 'required|string',
            'tarif' => 'nullable|numeric',
            'devise' => 'nullable|string',
            'actif' => 'nullable|boolean',
        ]);
        
        $type = TypeDossier::create($validated);
        return response()->json($type, 201);
    }

    public function updateTypeDossier(Request $request, $id)
    {
        $type = TypeDossier::findOrFail($id);
        
        $validated = $request->validate([
            'code' => 'nullable|string|unique:types_dossiers,code,' . $id,
            'libelle' => 'nullable|string',
            'tarif' => 'nullable|numeric',
            'devise' => 'nullable|string',
            'actif' => 'nullable|boolean',
        ]);

        $type->update($validated);
        return response()->json($type);
    }

    public function destroyTypeDossier($id)
    {
        TypeDossier::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // ─── REPRESENTATION ENTRY POINTS ─────────────────────────────────────────

    public function getEntryPoints(Request $request)
    {
        $query = RepresentationEntryPoint::orderBy('code');
        if ($request->filled('bureau_repr_id')) {
            $query->where('bureau_repr_id', $request->input('bureau_repr_id'));
        }
        return response()->json($query->get());
    }

    public function storeEntryPoint(Request $request)
    {
        $v = $request->validate([
            'id'             => 'required|string|unique:representation_entry_points,id',
            'code'           => 'required|string',
            'designation'    => 'required|string',
            'type'           => 'required|in:sortie,entree_pays',
            'bureau_repr_id' => 'nullable|string|exists:bureaux_representation,id',
            'is_active'      => 'nullable|boolean',
        ]);
        $entry = RepresentationEntryPoint::create($v);
        return response()->json($entry, 201);
    }

    public function updateEntryPoint(Request $request, $id)
    {
        $entry = RepresentationEntryPoint::findOrFail($id);
        $v = $request->validate([
            'code'           => 'sometimes|string',
            'designation'    => 'sometimes|string',
            'type'           => 'sometimes|in:sortie,entree_pays',
            'bureau_repr_id' => 'nullable|string|exists:bureaux_representation,id',
            'is_active'      => 'nullable|boolean',
        ]);
        $entry->update($v);
        return response()->json($entry);
    }

    public function destroyEntryPoint($id)
    {
        RepresentationEntryPoint::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // ─── REPRESENTATION EXIT POINTS ──────────────────────────────────────────

    public function getExitPoints(Request $request)
    {
        $query = RepresentationExitPoint::orderBy('code');
        if ($request->filled('bureau_repr_id')) {
            $query->where('bureau_repr_id', $request->input('bureau_repr_id'));
        }
        return response()->json($query->get());
    }

    public function storeExitPoint(Request $request)
    {
        $v = $request->validate([
            'id'             => 'required|string|unique:representation_exit_points,id',
            'code'           => 'required|string',
            'designation'    => 'required|string',
            'bureau_repr_id' => 'nullable|string|exists:bureaux_representation,id',
            'is_active'      => 'nullable|boolean',
        ]);
        $exit = RepresentationExitPoint::create($v);
        return response()->json($exit, 201);
    }

    public function updateExitPoint(Request $request, $id)
    {
        $exit = RepresentationExitPoint::findOrFail($id);
        $v = $request->validate([
            'code'           => 'sometimes|string',
            'designation'    => 'sometimes|string',
            'bureau_repr_id' => 'nullable|string|exists:bureaux_representation,id',
            'is_active'      => 'nullable|boolean',
        ]);
        $exit->update($v);
        return response()->json($exit);
    }

    public function destroyExitPoint($id)
    {
        RepresentationExitPoint::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
