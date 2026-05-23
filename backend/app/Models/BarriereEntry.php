<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarriereEntry extends Model
{
    protected $fillable = [
        'reference_passage',
        'dossier_id',
        'barriere_name',
        'agent_id',
        'date_passage',
        'status',
        'observations',
    ];

    protected function casts(): array
    {
        return [
            'date_passage' => 'datetime',
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
