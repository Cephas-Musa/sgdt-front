<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EmptyManifest;
use App\Models\Transaction;
use App\Models\BureauDouanier;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ManifestController extends Controller
{
    /**
     * Display a listing of empty manifests.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = EmptyManifest::with('user');

        // Filter by user if not admin/director
        if (!in_array($user->role, ['super_admin', 'directeur', 'directeur_provincial', 'inspecteur_chef'])) {
            $query->where('user_id', $user->id);
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('manifest_number', 'LIKE', "%{$search}%")
                  ->orWhere('plaque', 'LIKE', "%{$search}%")
                  ->orWhere('chauffeur', 'LIKE', "%{$search}%");
            });
        }

        $manifests = $query->orderBy('created_at', 'desc')->get();

        return response()->json($manifests);
    }

    /**
     * Store a newly created empty manifest.
     */
    public function store(Request $request)
    {
        $request->validate([
            'plaque' => 'required|string|max:50',
            'chauffeur' => 'required|string|max:255',
            'pays_provenance' => 'required|string|max:10',
            'pays_destination' => 'required|string|max:10',
            'bureau_id' => 'required|string|max:50',
            'date_declaration' => 'nullable|date',
        ]);

        $user = $request->user();

        // Retrieve pricing from customs office if exists
        $bureau = BureauDouanier::find($request->input('bureau_id'));
        $price = $bureau ? $bureau->manifest_price : 25.00;

        // Generate manifest number
        $year = date('Y');
        $random = rand(1000, 9999);
        $manifestNumber = "EMP/{$year}/{$random}";

        while (EmptyManifest::where('manifest_number', $manifestNumber)->exists()) {
            $random = rand(1000, 9999);
            $manifestNumber = "EMP/{$year}/{$random}";
        }

        $manifest = EmptyManifest::create([
            'manifest_number' => $manifestNumber,
            'plaque' => $request->input('plaque'),
            'chauffeur' => $request->input('chauffeur'),
            'pays_provenance' => $request->input('pays_provenance'),
            'pays_destination' => $request->input('pays_destination'),
            'date_declaration' => $request->input('date_declaration') ?? now(),
            'bureau_id' => $request->input('bureau_id'),
            'facture_statut' => 'non_paye',
            'user_id' => $user->id,
        ]);

        return response()->json([
            'manifest' => $manifest,
            'amount_due' => $price,
            'currency' => 'USD'
        ], 201);
    }

    /**
     * Pay for an empty manifest using user's virtual wallet.
     */
    public function pay(Request $request, $id)
    {
        $manifest = EmptyManifest::findOrFail($id);

        if ($manifest->facture_statut === 'paye') {
            return response()->json(['message' => 'Le manifeste est déjà payé.'], 400);
        }

        $user = $request->user();
        $bureau = BureauDouanier::find($manifest->bureau_id);
        $price = $bureau ? $bureau->manifest_price : 25.00;

        if ($user->wallet_balance < $price) {
            return response()->json(['message' => 'Solde de portefeuille insuffisant.'], 400);
        }

        DB::beginTransaction();
        try {
            // Deduct from wallet
            $user->wallet_balance -= $price;
            $user->save();

            // Mark manifest as paid
            $manifest->facture_statut = 'paye';
            $manifest->save();

            // Record transaction
            Transaction::create([
                'user_id' => $user->id,
                'reference' => 'TX-' . Str::uuid(),
                'type' => 'paiement',
                'amount' => $price,
                'currency' => 'USD',
                'status' => 'reussi',
                'description' => "Paiement Manifeste Vide {$manifest->manifest_number}",
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Paiement effectué avec succès.',
                'manifest' => $manifest,
                'new_balance' => $user->wallet_balance
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors du paiement.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
