<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DossierSignataire extends Model
{
    protected $table = 'dossier_signataires';

    protected $fillable = [
        'dossier_id',
        'type_signataire',
    ];

    public function dossier()
    {
        return $this->belongsTo(DossierControle::class, 'dossier_id');
    }
}
