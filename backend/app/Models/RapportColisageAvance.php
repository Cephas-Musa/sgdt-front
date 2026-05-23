<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RapportColisage extends Model
{
    protected $table = 'rapports_colisage';

    protected $fillable = [
        'reference',
        'dossier_id',
        'nombre_colis',
        'nombre_comptabilise',
        'poids_colis',
        'observations',
        'status',
        'user_id',
        'approuve_par',
        'date_approbation',
    ];

    protected $casts = [
        'poids_colis' => 'decimal:2',
        'date_approbation' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approuvePar()
    {
        return $this->belongsTo(User::class, 'approuve_par');
    }

    public function dossier()
    {
        return $this->belongsTo(Dossier::class, 'dossier_id', 'id');
    }
}
