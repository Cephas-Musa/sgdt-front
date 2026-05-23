<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Apurement extends Model
{
    protected $fillable = [
        'dossier_id',
        'secretaire_id',
        'ref_douane',
        'date_apurement',
        'date_soumission',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'date_apurement' => 'date',
            'date_soumission' => 'datetime',
        ];
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class, 'dossier_id');
    }

    public function secretaire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'secretaire_id');
    }
}
