<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Denombrement extends Model
{
    protected $table = 'denombrements';

    protected $fillable = [
        'reference',
        'entrepot_id',
        'date_denombrement',
        'quantite_theorique',
        'quantite_comptabilisee',
        'difference',
        'observations',
        'status',
        'approuve_par_chef',
        'user_id',
        'chef_id',
    ];

    protected $casts = [
        'date_denombrement' => 'date',
        'approuve_par_chef' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function chef()
    {
        return $this->belongsTo(User::class, 'chef_id');
    }

    public function entrepot()
    {
        return $this->belongsTo(Entrepot::class, 'entrepot_id', 'id');
    }
}
