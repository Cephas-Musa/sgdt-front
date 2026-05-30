<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Str;

class AuditLogService
{
    /**
     * Logue une action dans l'audit global.
     */
    public static function log(string $module, string $action, ?string $targetId = null, ?array $oldData = null, ?array $newData = null): void
    {
        $userId = auth()->id();
        
        AuditLog::create([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'action' => $action,
            'module' => $module,
            'target_id' => $targetId,
            'old_data' => $oldData,
            'new_data' => $newData,
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'device' => request()->header('User-Agent') ?? 'System',
        ]);
    }
}
