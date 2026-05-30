<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'group',
        'key',
        'value',
        'description',
        'is_system',
    ];

    protected $casts = [
        'value' => 'array',
        'is_system' => 'boolean',
    ];
}
