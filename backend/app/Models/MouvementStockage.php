<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MouvementStockage extends Model
{
    protected $table = 'mouvements_stockage';

    protected $fillable = [
        'dossier_id',
        'entrepot_id',
        'espace_id',
        'type_mouvement',
        'quantite',
        'poids',
        'observations',
        'user_id',
        'date_mouvement',
    ];

    protected $casts = [
        'poids' => 'decimal:2',
        'date_mouvement' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dossier()
    {
        return $this->belongsTo(Dossier::class, 'dossier_id', 'id');
    }

    public function entrepot()
    {
        return $this->belongsTo(Entrepot::class, 'entrepot_id', 'id');
    }
}
