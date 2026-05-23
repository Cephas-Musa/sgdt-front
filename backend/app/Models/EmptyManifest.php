<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmptyManifest extends Model
{
    protected $fillable = [
        'manifest_number',
        'plaque',
        'chauffeur',
        'pays_provenance',
        'pays_destination',
        'date_declaration',
        'bureau_id',
        'status',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'date_declaration' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
