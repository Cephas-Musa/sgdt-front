<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TitreDocument extends Model
{
    protected $fillable = [
        'mouvement_id',
        'reference_dra',
        'date_dra',
        'reference_t1',
        'date_t1',
    ];

    protected function casts(): array
    {
        return [
            'date_dra' => 'date',
            'date_t1' => 'date',
        ];
    }

    public function mouvement(): BelongsTo
    {
        return $this->belongsTo(Mouvement::class);
    }
}
