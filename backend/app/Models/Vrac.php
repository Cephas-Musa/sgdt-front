<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vrac extends Model
{
    protected $table = 'vracs';

    protected $fillable = [
        'reference',
        'dossier_id',
        'type',
        'importateur',
        'plaque',
        'quantite',
        'poids',
        'status',
        'user_id',
    ];

    protected $casts = [
        'poids' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dossier()
    {
        return $this->belongsTo(Dossier::class, 'dossier_id', 'id');
    }
}
