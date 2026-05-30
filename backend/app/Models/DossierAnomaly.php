<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\AlertSeverity;

class DossierAnomaly extends Model
{
    protected $fillable = [
        'dossier_id',
        'type',
        'severity',
        'description',
        'detected_by',
        'resolved',
        'resolved_by',
        'resolved_at',
    ];

    protected $casts = [
        'severity' => AlertSeverity::class,
        'resolved' => 'boolean',
        'resolved_at' => 'datetime',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function detector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'detected_by');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
