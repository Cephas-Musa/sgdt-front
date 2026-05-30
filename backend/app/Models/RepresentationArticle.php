<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepresentationArticle extends Model
{
    protected $fillable = [
        'representation_entry_id',
        'dossier_id',
        'designation',
        'position_tarifaire',
        'quantite',
        'poids',
        'fob',
    ];

    protected $casts = [
        'quantite' => 'float',
        'poids'    => 'float',
        'fob'      => 'float',
    ];

    public function representationEntry(): BelongsTo
    {
        return $this->belongsTo(RepresentationEntry::class);
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }
}
