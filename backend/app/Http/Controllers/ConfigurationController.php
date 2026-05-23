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

class ConfigurationController extends Controller
{
    public function getCountries()
    {
        return response()->json(Pays::orderBy('designation')->get());
    }

    public function getCurrencies()
    {
        return response()->json(Devise::all());
    }

    public function getCustomsOffices()
    {
        return response()->json(BureauDouanier::orderBy('denomination')->get());
    }

    public function storeCustomsOffice(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:bureau_douaniers,id',
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
            'id' => 'required|string|unique:direction_provinciales,id',
            'numero' => 'nullable|integer',
            'denomination' => 'required|string',
            'nombre_bureaux' => 'nullable|integer',
            'directeur' => 'nullable|string',
            'telephone' => 'nullable|string',
            'email' => 'nullable|string',
        ]);
        $dir = DirectionProvinciale::create($validated);
        return response()->json($dir, 201);
    }

    public function updateProvincialDirection(Request $request, $id)
    {
        $dir = DirectionProvinciale::findOrFail($id);
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
}
