<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\ValidationType;

class DossierValidation extends Model
{
    protected $fillable = [
        'dossier_id',
        'validated_by',
        'validation_type',
        'status',
        'observation',
        'validated_ip',
        'validated_device',
        'validated_at',
    ];

    protected $casts = [
        'validation_type' => ValidationType::class,
        'validated_at' => 'datetime',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }
}
