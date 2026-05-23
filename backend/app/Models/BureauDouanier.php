<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BureauDouanier extends Model
{
    protected $table = 'bureaux_douaniers';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'code',
        'denomination',
        'icb',
        'province',
        'manifest_price',
    ];

    protected function casts(): array
    {
        return [
            'manifest_price' => 'decimal:2',
        ];
    }
}
