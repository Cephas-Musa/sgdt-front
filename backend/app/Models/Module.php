<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'is_active',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
