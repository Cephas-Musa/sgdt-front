<?php

namespace App\Services;

use App\Models\DossierTimeline;
use Illuminate\Support\Facades\Log;

class DossierTimelineService
{
    /**
     * Consigner une action dans la timeline du dossier
     */
    public static function log(
        string $dossier_id,
        string $user_id,
        string $event,
        string $module,
        ?string $description = null
    ): void {
        try {
            DossierTimeline::create([
                'dossier_id' => $dossier_id,
                'user_id' => $user_id,
                'event' => $event,
                'module' => $module,
                'description' => $description,
            ]);
        } catch (\Exception $e) {
            Log::error("Erreur DossierTimelineService: " . $e->getMessage());
        }
    }
}
