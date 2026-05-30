<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DossierVersion extends Model
{
    protected $fillable = [
        'dossier_id',
        'version_number',
        'snapshot',
        'created_by',
    ];

    protected $casts = [
        'snapshot' => 'array',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
