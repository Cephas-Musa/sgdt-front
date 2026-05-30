<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartenaireCommission extends Model
{
    use HasFactory;

    protected $table = 'partenaire_commissions';

    protected $fillable = [
        'user_id',
        'bureau_id',
        'type_dossier_id',
        'type_commission',
        'valeur_commission',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
