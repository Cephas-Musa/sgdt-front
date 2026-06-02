<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Mouvement extends Model
{
    protected $fillable = [
        'operation_type',
        'plaque',
        'chauffeur',
        'importateur',
        'date_mouvement',
        'sub_type_operation',
        'empty_manifest',
        'date_empty_manifest',
        'custom_fields',
        'user_id',
        'dossier_id',
    ];

    protected function casts(): array
    {
        return [
            'date_mouvement' => 'datetime',
            'date_empty_manifest' => 'datetime',
            'custom_fields' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function titreDocument(): HasOne
    {
        return $this->hasOne(TitreDocument::class);
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }
}
