<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TypingDocTranshipment extends Model
{
    use HasUuids;

    protected $table = 'typing_docs_transhipment';

    protected $fillable = [
        'dossier_id',
        'typing_operator_id',
        'nombre_vehicules',
        'transhipped_to',
        'vehicule_reference',
        'container_number',
        'document_reference',
        'date_doc',
        'status',
        'notes',
    ];

    protected $casts = [
        'date_doc'         => 'date',
        'nombre_vehicules' => 'integer',
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
