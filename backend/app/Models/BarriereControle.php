<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BarriereControle extends Model
{
    use SoftDeletes;

    protected $table = 'barrieres_controle';

    protected $fillable = [
        'nom',
        'entite',
        'brigadier_id',
        'status',
    ];

    public function brigadier()
    {
        return $this->belongsTo(User::class, 'brigadier_id');
    }

    public function dossiers()
    {
        return $this->hasMany(DossierControle::class, 'barriere_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
