<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartenaireTransaction extends Model
{
    protected $table = 'partenaire_transactions';

    protected $fillable = [
        'partenaire_id',
        'dossier_id',
        'bureau_id',
        'type_dossier_id',
        'prix_global',
        'part_partenaire',
        'part_systeme',
        'date',
    ];

    protected function casts(): array
    {
        return [
            'prix_global' => 'decimal:2',
            'part_partenaire' => 'decimal:2',
            'part_systeme' => 'decimal:2',
            'date' => 'datetime',
        ];
    }

    public function partenaire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'partenaire_id');
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class, 'dossier_id');
    }
}
