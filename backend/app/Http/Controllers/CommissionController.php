<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\BarrierCommission;
use App\Models\BarrierRevenue;
use App\Models\Barriere;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Support\Str;

class CommissionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    private function checkAccess(Request $request): void
    {
        $user = $request->user();
        if (!in_array($user->role, ['chef_barriere', 'super_admin', 'directeur_provincial'])) {
            abort(403, 'Non autorisé');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $this->checkAccess($request);
        $query = BarrierCommission::with(['typingOperator', 'approver']);

        if ($request->filled('barriere_code')) {
            $query->where('barriere_code', $request->input('barriere_code'));
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->input('statut'));
        }

        if ($request->filled('typing_operator_id')) {
            $query->where('typing_operator_id', $request->input('typing_operator_id'));
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(50)
        );
    }

    public function calculate(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->checkAccess($request);

        $validated = $request->validate([
            'barriere_code' => 'required|string|max:50',
            'typing_operator_id' => 'required|exists:users,id',
            'document_type' => 'required|in:direct,transhipment,it,manifest',
            'reference_document' => 'required|string|max:100',
            'montant_base' => 'required|numeric|min:0',
        ]);

        $barriere = Barriere::where('code', $validated['barriere_code'])->first();
        if (!$barriere) {
            return response()->json(['message' => 'Barrière non trouvée.'], 404);
        }

        $taux = $barriere->commission_taux;
        $commissionAmount = 0;

        if ($barriere->commission_type === 'pourcentage') {
            $commissionAmount = $validated['montant_base'] * ($taux / 100);
        } elseif ($barriere->commission_type === 'fixe') {
            $commissionAmount = $taux;
        } elseif ($barriere->commission_type === 'degresif') {
            $montant = $validated['montant_base'];
            if ($montant <= 100) {
                $commissionAmount = $montant * 0.05;
            } elseif ($montant <= 500) {
                $commissionAmount = $montant * 0.08;
            } elseif ($montant <= 1000) {
                $commissionAmount = $montant * 0.10;
            } else {
                $commissionAmount = $montant * 0.12;
            }
        }

        $commission = BarrierCommission::create([
            'id' => (string) Str::uuid(),
            'barriere_code' => $validated['barriere_code'],
            'typing_operator_id' => $validated['typing_operator_id'],
            'reference_document' => $validated['reference_document'],
            'document_type' => $validated['document_type'],
            'montant_base' => $validated['montant_base'],
            'taux' => $commissionAmount > 0 && $validated['montant_base'] > 0
                ? round(($commissionAmount / $validated['montant_base']) * 100, 2)
                : 0,
            'commission' => round($commissionAmount, 2),
            'currency' => 'USD',
            'statut' => 'calculee',
            'date_calcul' => now(),
        ]);

        AuditLogService::log('barriere_commission', 'calculate', $commission->id, null, [
            'barriere_code' => $validated['barriere_code'],
            'montant_base' => $validated['montant_base'],
            'commission' => $commissionAmount,
            'taux' => $taux,
        ]);

        return response()->json($commission->load('typingOperator'), 201);
    }

    public function approve(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $this->checkAccess($request);

        $commission = BarrierCommission::findOrFail($id);
        $commission->update([
            'statut' => 'approuvee',
            'approved_by' => $user->id,
        ]);

        AuditLogService::log('barriere_commission', 'approve', $id, null, [
            'approved_by' => $user->id,
        ]);

        return response()->json($commission);
    }

    public function pay(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $this->checkAccess($request);

        $commission = BarrierCommission::findOrFail($id);
        $commission->update([
            'statut' => 'payee',
            'date_paiement' => now(),
        ]);

        AuditLogService::log('barriere_commission', 'pay', $id, null, [
            'paid_by' => $user->id,
            'amount' => $commission->commission,
        ]);

        return response()->json($commission);
    }

    public function cancel(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $this->checkAccess($request);

        $commission = BarrierCommission::findOrFail($id);
        $commission->update([
            'statut' => 'annulee',
            'notes' => $request->input('notes', $commission->notes),
        ]);

        AuditLogService::log('barriere_commission', 'cancel', $id, null, [
            'canceled_by' => $user->id,
            'notes' => $request->input('notes'),
        ]);

        return response()->json($commission);
    }

    public function stats(Request $request): JsonResponse
    {
        $this->checkAccess($request);

        $query = BarrierCommission::query();

        if ($request->filled('barriere_code')) {
            $query->where('barriere_code', $request->input('barriere_code'));
        }

        $totalCommission = (clone $query)->where('statut', 'payee')->sum('commission');
        $pendingCommission = (clone $query)->whereIn('statut', ['calculee', 'approuvee'])->sum('commission');
        $totalApproved = (clone $query)->where('statut', 'approuvee')->count();
        $totalPaid = (clone $query)->where('statut', 'payee')->count();

        return response()->json([
            'total_commission_payee' => round($totalCommission, 2),
            'total_commission_en_attente' => round($pendingCommission, 2),
            'total_approuvees' => $totalApproved,
            'total_payees' => $totalPaid,
        ]);
    }

    public function operatorBalance(Request $request, string $operatorId): JsonResponse
    {
        $operator = User::findOrFail($operatorId);

        $total = BarrierCommission::where('typing_operator_id', $operatorId)
            ->where('statut', 'payee')
            ->sum('commission');

        $pending = BarrierCommission::where('typing_operator_id', $operatorId)
            ->whereIn('statut', ['calculee', 'approuvee'])
            ->sum('commission');

        return response()->json([
            'operator' => $operator->only(['id', 'full_name', 'matricule']),
            'total_commission_percue' => round($total, 2),
            'commission_en_attente' => round($pending, 2),
            'currency' => 'USD',
        ]);
    }
}
