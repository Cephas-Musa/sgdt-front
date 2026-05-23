<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Batiment extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'entrepot_id',
    ];

    public function espaces(): HasMany
    {
        return $this->hasMany(EspaceStockage::class);
    }
}
