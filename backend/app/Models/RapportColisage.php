<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RapportColisage extends Model
{
    protected $table = 'rapports_colisage';

    protected $fillable = [
        'dossier_id',
        'agent_id',
        'date_creation',
        'date_soumission',
        'lignes',
        'lignes_chef',
        'total_quantite',
        'total_poids',
        'notes',
        'notes_chef',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_creation' => 'datetime',
            'date_soumission' => 'datetime',
            'lignes' => 'array',
            'lignes_chef' => 'array',
            'total_poids' => 'decimal:2',
        ];
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class, 'dossier_id');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }
}
