<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ColisageAffectation extends Model
{
    protected $table = 'colisage_affectations';

    protected $fillable = [
        'dossier_id',
        'agent_id',
        'chef_entrepot_douane_id',
        'date_affectation',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_affectation' => 'datetime',
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

    public function chef(): BelongsTo
    {
        return $this->belongsTo(User::class, 'chef_entrepot_douane_id');
    }
}
