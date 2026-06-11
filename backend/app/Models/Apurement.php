<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Apurement extends Model
{
    use HasUuids;

    protected $fillable = [
        'dossier_id',
        'user_id',
        'secretaire_id',
        'type_appurement',
        'ref_douane',
        'date_reference_douane',
        'date_apurement',
        'date_soumission',
        'dra',
        'dra_date',
        't1',
        't1_date',
        'plaque_avant',
        'plaque_arriere',
        'status',
        'observation',
        'validated_by',
        'validated_at',
    ];

    protected function casts(): array
    {
        return [
            'date_apurement' => 'date',
            'date_reference_douane' => 'date',
            'dra_date' => 'date',
            't1_date' => 'date',
            'date_soumission' => 'datetime',
            'validated_at' => 'datetime',
        ];
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class, 'dossier_id');
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function secretaire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'secretaire_id');
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }
}
