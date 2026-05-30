<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DossierDocument extends Model
{
    protected $fillable = [
        'dossier_id',
        'document_type',
        'file_path',
        'uploaded_by',
        'verified',
        'verified_by',
    ];

    protected $casts = [
        'verified' => 'boolean',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
