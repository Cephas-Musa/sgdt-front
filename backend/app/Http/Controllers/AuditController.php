<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AuditLog;

class AuditController extends Controller
{
    /**
     * Liste des journaux d'audit (AuditLogs)
     * Filterable by user_id and module
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

        if ($request->has('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->has('module')) {
            $query->where('module', $request->input('module'));
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        return response()->json($logs);
    }
}
