<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarrierRevenue extends Model
{
    protected $table = 'barrier_revenues';

    protected $fillable = [
        'barriere_code',
        'typing_operator_id',
        'document_type',
        'document_id',
        'amount',
        'currency',
        'date_revenue',
    ];

    protected $casts = [
        'amount'       => 'float',
        'date_revenue' => 'date',
    ];

    public function typingOperator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'typing_operator_id');
    }
}
