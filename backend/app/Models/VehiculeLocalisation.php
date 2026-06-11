<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehiculeLocalisation extends Model
{
    use HasUuids;

    protected $fillable = [
        'plaque',
        'position',
        'status',
        'last_seen_at',
        'dossier_id',
        'chauffeur',
        'importateur',
    ];

    protected function casts(): array
    {
        return [
            'last_seen_at' => 'datetime',
        ];
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }
}
