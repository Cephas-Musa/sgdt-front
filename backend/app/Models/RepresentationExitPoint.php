<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepresentationExitPoint extends Model
{
    use SoftDeletes;

    protected $table = 'representation_exit_points';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'code', 'designation', 'bureau_repr_id', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function bureauRepresentation(): BelongsTo
    {
        return $this->belongsTo(BureauRepresentation::class, 'bureau_repr_id');
    }
}
