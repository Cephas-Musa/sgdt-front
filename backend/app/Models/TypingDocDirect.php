<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TypingDocDirect extends Model
{
    use HasUuids;

    protected $table = 'typing_docs_direct';

    protected $fillable = [
        'dossier_id',
        'typing_operator_id',
        'barriere_code',
        'office',
        'entree_reference',
        'date_entree',
        't1_reference',
        't1_date',
        'consignee',
        'country_of_export',
        'vehicule_reference',
        'container_number',
        'container_20',
        'container_40',
        'status',
        'notes',
    ];

    protected $casts = [
        'date_entree'  => 'date',
        't1_date'      => 'date',
        'container_20' => 'integer',
        'container_40' => 'integer',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function typingOperator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'typing_operator_id');
    }
}
