<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barriere extends Model
{
    protected $table = 'barrieres';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'code',
        'nom',
        'type',
        'localisation',
        'province',
        'pays',
        'balance_financiere',
        'status',
    ];

    protected $casts = [
        'balance_financiere' => 'decimal:2',
    ];

    public function typingOperators()
    {
        return $this->hasMany(User::class, 'barriere_id', 'id')
            ->where('role', 'typing_operator');
    }

    public function chefs()
    {
        return $this->hasMany(User::class, 'barriere_id', 'id')
            ->where('role', 'chef_barriere');
    }

    public function mouvements()
    {
        return $this->hasMany(BarriereEntry::class, 'barriere_id', 'id');
    }
}
