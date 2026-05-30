<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReferenceGeneratorService
{
    /**
     * Generate a simple reference.
     * Format: {Prefix}-0001
     * 
     * @return string
     */
    public static function generate(string $prefix = 'DR-'): string
    {
        return DB::transaction(function () use ($prefix) {
            // Get the latest reference
            $latest = DB::table('dossiers')
                ->where('reference', 'LIKE', $prefix . '%')
                ->orderBy('id', 'desc')
                ->lockForUpdate()
                ->first();

            if (!$latest) {
                $sequence = 1;
            } else {
                $parts = explode('-', $latest->reference);
                $sequence = intval(end($parts)) + 1;
            }

            return sprintf("%s%04d", $prefix, $sequence);
        });
    }
}
