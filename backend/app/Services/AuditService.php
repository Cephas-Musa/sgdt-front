<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class AuditService
{
    /**
     * Log an audit event.
     *
     * @param string $action
     * @param string $module
     * @param mixed $oldValue
     * @param mixed $newValue
     * @return void
     */
    public function log(string $action, string $module, $oldValue = null, $newValue = null): void
    {
        DB::table('audit_logs')->insert([
            'user_id' => auth()->id(),
            'action' => $action,
            'module' => $module,
            'old_value' => is_array($oldValue) ? json_encode($oldValue) : $oldValue,
            'new_value' => is_array($newValue) ? json_encode($newValue) : $newValue,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
