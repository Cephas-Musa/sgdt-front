<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DossierControle extends Model
{
    protected $table = 'dossiers_controle';

    protected $fillable = [
        'barriere_id',
        'brigadier_id',
        'nom_importateur',
        'plaque_avant',
        'plaque_arriere',
        'reference_douane',
        'date_controle',
        'reference_bon_sortie',
        'balle',
        'autorisation_speciale',
        'type_autorisation',
        'reference_autorisation',
        'date_autorisation',
    ];

    protected $casts = [
        'date_controle' => 'datetime',
        'date_autorisation' => 'datetime',
        'autorisation_speciale' => 'boolean',
    ];

    public function barriere()
    {
        return $this->belongsTo(BarriereControle::class, 'barriere_id');
    }

    public function brigadier()
    {
        return $this->belongsTo(User::class, 'brigadier_id');
    }

    public function signataires()
    {
        return $this->hasMany(DossierSignataire::class, 'dossier_id');
    }
}
