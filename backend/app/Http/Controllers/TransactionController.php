<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\PartenaireTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    /**
     * Display a listing of general transactions for the logged user.
     */
    public function indexTransactions(Request $request)
    {
        $user = $request->user();
        $query = Transaction::query();

        // Standard user only sees their own transactions
        if (!in_array($user->role, ['super_admin', 'directeur', 'directeur_provincial'])) {
            $query->where('user_id', $user->id);
        } else {
            $query->with('user');
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Display partner transaction distribution.
     */
    public function indexPartenaireTransactions(Request $request)
    {
        $user = $request->user();
        $query = PartenaireTransaction::with('dossier');

        // Partners only see their own transactions
        if ($user->role === 'partenaire') {
            $query->where('partenaire_id', $user->id);
        } else {
            $query->with('partenaire');
        }

        return response()->json($query->orderBy('date', 'desc')->get());
    }

    /**
     * Recharge a user's wallet (Admin or self for simulation).
     */
    public function rechargeWallet(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'user_id' => 'nullable|integer|exists:users,id',
            'description' => 'nullable|string',
        ]);

        $admin = $request->user();
        // If user_id is provided, admin can recharge others, else recharge self
        $targetUserId = $request->input('user_id') ?? $admin->id;
        
        if ($targetUserId !== $admin->id && !in_array($admin->role, ['super_admin', 'directeur'])) {
            return response()->json(['message' => 'Non autorisé à recharger d\'autres portefeuilles.'], 403);
        }

        $targetUser = User::findOrFail($targetUserId);

        DB::beginTransaction();
        try {
            $targetUser->wallet_balance += $request->input('amount');
            $targetUser->save();

            $transaction = Transaction::create([
                'user_id' => $targetUser->id,
                'reference' => 'RCG-' . Str::uuid(),
                'type' => 'recharge',
                'amount' => $request->input('amount'),
                'currency' => 'USD',
                'status' => 'reussi',
                'description' => $request->input('description') ?? 'Recharge de portefeuille',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Recharge effectuée avec succès.',
                'new_balance' => $targetUser->wallet_balance,
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la recharge.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deduct money from user wallet for dossier creation or other operations.
     */
    public function chargeDossier(User $user, float $amount, string $dossierId)
    {
        if ($user->wallet_balance < $amount) {
            return false; // Insufficient funds
        }

        DB::beginTransaction();
        try {
            $user->wallet_balance -= $amount;
            $user->save();

            $transaction = Transaction::create([
                'user_id' => $user->id,
                'reference' => 'DOS-' . Str::uuid(),
                'type' => 'paiement',
                'amount' => $amount,
                'currency' => 'USD',
                'status' => 'reussi',
                'description' => "Paiement pour le dossier " . $dossierId,
            ]);

            DB::commit();
            return $transaction;
        } catch (\Exception $e) {
            DB::rollBack();
            return false;
        }
    }
}
