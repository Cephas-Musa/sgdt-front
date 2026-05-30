<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RepresentationEntry extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'dossier_id',
        'operateur_id',
        'bureau_repr_id',
        'importateur',
        'nif',
        'bureau_etranger_code',
        'bureau_etranger_nom',
        'dra_reference',
        'dra_date',
        't1_reference',
        't1_date',
        'immatriculation_avant',
        'immatriculation_arriere',
        'devise',
        'pays_provenance_code',
        'pays_provenance_nom',
        'numero_conteneur',
        'container_20',
        'container_40',
        'incoterm',
        'bureau_sortie_code',
        'bureau_sortie_nom',
        'fob_total',
        'status',
        'observations',
    ];

    protected $casts = [
        'dra_date'  => 'date',
        't1_date'   => 'date',
        'fob_total' => 'float',
        'container_20' => 'integer',
        'container_40' => 'integer',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function operateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'operateur_id');
    }

    public function articles(): HasMany
    {
        return $this->hasMany(RepresentationArticle::class);
    }
}
