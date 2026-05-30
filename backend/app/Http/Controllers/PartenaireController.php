<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\PartenaireCommission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PartenaireController extends Controller
{
    /**
     * Return all partenaires with their commission configurations.
     */
    public function index()
    {
        $partenaires = User::where('role', 'partenaire')->get()->map(function ($user) {
            $commissions = PartenaireCommission::where('user_id', $user->id)->get();
            
            // Group by bureau_id to match frontend structure
            $bureauxMap = [];
            foreach ($commissions as $comm) {
                if (!isset($bureauxMap[$comm->bureau_id])) {
                    $bureauxMap[$comm->bureau_id] = [
                        'bureauId' => $comm->bureau_id,
                        'commissions' => []
                    ];
                }
                $bureauxMap[$comm->bureau_id]['commissions'][] = [
                    'typeDossierId' => $comm->type_dossier_id,
                    'typeCommission' => $comm->type_commission,
                    'valeurCommission' => floatval($comm->valeur_commission)
                ];
            }

            return [
                'id' => $user->id,
                'nom' => $user->full_name,
                'contact' => $user->contact ?? '',
                'telephone' => $user->phone_number ?? '',
                'email' => $user->email ?? '',
                'username' => $user->matricule ?? '', // Reusing matricule as username identifier if needed
                'bureaux' => array_values($bureauxMap),
            ];
        });

        return response()->json($partenaires);
    }

    /**
     * Store a newly created partenaire in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string',
            'contact' => 'nullable|string',
            'telephone' => 'required|string',
            'email' => 'nullable|email',
            'password' => 'required|string',
            'username' => 'required|string|unique:users,matricule',
            'bureaux' => 'array',
        ]);

        DB::beginTransaction();
        try {
            // Create user
            $user = User::create([
                'full_name' => $validated['nom'],
                'phone_number' => $validated['telephone'],
                'password' => Hash::make($validated['password']),
                'role' => 'partenaire',
                'matricule' => $validated['username'], // Save username here
                'email' => $validated['email'] ?? null,
                'contact' => $validated['contact'] ?? null,
                'status' => 'actif'
            ]);

            // Create commissions
            if (isset($validated['bureaux'])) {
                foreach ($validated['bureaux'] as $bureau) {
                    if (isset($bureau['commissions'])) {
                        foreach ($bureau['commissions'] as $comm) {
                            PartenaireCommission::create([
                                'user_id' => $user->id,
                                'bureau_id' => $bureau['bureauId'],
                                'type_dossier_id' => $comm['typeDossierId'],
                                'type_commission' => $comm['typeCommission'],
                                'valeur_commission' => $comm['valeurCommission'],
                            ]);
                        }
                    }
                }
            }

            DB::commit();
            return response()->json(['message' => 'Partenaire créé', 'id' => $user->id], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur de création', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified partenaire in storage.
     */
    public function update(Request $request, $id)
    {
        $user = User::where('role', 'partenaire')->findOrFail($id);

        $validated = $request->validate([
            'nom' => 'required|string',
            'contact' => 'nullable|string',
            'telephone' => 'required|string',
            'email' => 'nullable|email',
            'password' => 'nullable|string',
            'username' => 'required|string|unique:users,matricule,' . $id,
            'bureaux' => 'array',
        ]);

        DB::beginTransaction();
        try {
            $updateData = [
                'full_name' => $validated['nom'],
                'phone_number' => $validated['telephone'],
                'matricule' => $validated['username'],
                'email' => $validated['email'] ?? null,
                'contact' => $validated['contact'] ?? null,
            ];

            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user->update($updateData);

            // Recreate commissions
            if (isset($validated['bureaux'])) {
                PartenaireCommission::where('user_id', $user->id)->delete();
                
                foreach ($validated['bureaux'] as $bureau) {
                    if (isset($bureau['commissions'])) {
                        foreach ($bureau['commissions'] as $comm) {
                            PartenaireCommission::create([
                                'user_id' => $user->id,
                                'bureau_id' => $bureau['bureauId'],
                                'type_dossier_id' => $comm['typeDossierId'],
                                'type_commission' => $comm['typeCommission'],
                                'valeur_commission' => $comm['valeurCommission'],
                            ]);
                        }
                    }
                }
            }

            DB::commit();
            return response()->json(['message' => 'Partenaire mis à jour']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur de mise à jour', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified partenaire from storage.
     */
    public function destroy($id)
    {
        $user = User::where('role', 'partenaire')->findOrFail($id);
        $user->delete(); // Cascades to partenaire_commissions if set in DB or we can rely on Eloquent events

        return response()->json(['message' => 'Partenaire supprimé']);
    }
}
