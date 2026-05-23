<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DirectionProvinciale extends Model
{
    protected $table = 'directions_provinciales';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'numero',
        'denomination',
        'nombre_bureaux',
        'directeur',
        'telephone',
        'email',
        'date_creation',
    ];
}
