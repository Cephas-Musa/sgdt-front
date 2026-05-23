<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dossier extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'reference',
        'reference_douane',
        'type',
        'importateur',
        'exportateur',
        'declarant',
        'nif',
        'dra',
        't1',
        'vehicule',
        'plaque',
        'pays',
        'provenance',
        'destination',
        'localisation',
        'type_marchandises',
        'quantite',
        'poids',
        'colis',
        'devise',
        'status',
        'montant',
        'bureau_repr',
        'province',
        'nombre_declarations',
        'user_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }
}
