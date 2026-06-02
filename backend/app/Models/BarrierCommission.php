<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarrierCommission extends Model
{
    protected $table = 'barrier_commissions';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'barriere_code',
        'typing_operator_id',
        'reference_document',
        'document_type',
        'montant_base',
        'taux',
        'commission',
        'currency',
        'statut',
        'date_calcul',
        'date_paiement',
        'approved_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'montant_base' => 'decimal:2',
            'taux' => 'decimal:2',
            'commission' => 'decimal:2',
            'date_calcul' => 'datetime',
            'date_paiement' => 'datetime',
        ];
    }

    public function typingOperator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'typing_operator_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function barriere()
    {
        return $this->belongsTo(Barriere::class, 'barriere_code', 'code');
    }
}
