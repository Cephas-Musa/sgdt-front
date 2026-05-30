<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeDossier extends Model
{
    use HasFactory;

    protected $table = 'types_dossiers';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'code',
        'libelle',
        'tarif',
        'devise',
        'actif',
    ];

    protected $casts = [
        'tarif' => 'float',
        'actif' => 'boolean',
    ];
}
