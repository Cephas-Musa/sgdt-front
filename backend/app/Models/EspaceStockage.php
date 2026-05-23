<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EspaceStockage extends Model
{
    use HasFactory;

    protected $table = 'espaces_stockage';

    protected $fillable = [
        'nom',
        'capacite',
        'occupe',
        'status',
        'batiment_id',
    ];

    public function batiment(): BelongsTo
    {
        return $this->belongsTo(Batiment::class);
    }
}
