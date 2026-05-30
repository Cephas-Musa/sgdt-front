<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItEntry extends Model
{
    use HasUuids;

    protected $table = 'it_entries';

    protected $fillable = [
        'dossier_id',
        'typing_operator_id',
        'consignee',
        'chassis',
        'vehicule_mark',
        'manifest_year',
        'color',
        'it_reference',
        'status',
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
