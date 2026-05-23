<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BureauRepresentation extends Model
{
    protected $table = 'bureaux_representation';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'code',
        'denomination',
        'type',
        'ville',
        'pays',
        'status',
    ];
}
