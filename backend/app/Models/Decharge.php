<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Decharge extends Model
{
    protected $table = 'dechargements';

    protected $fillable = [
        'reference',
        'dossier_id',
        'entrepot_id',
        'quantite_attendue',
        'quantite_reelle',
        'observations',
        'status',
        'user_id',
        'date_decharge',
    ];

    protected $casts = [
        'date_decharge' => 'datetime',
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
