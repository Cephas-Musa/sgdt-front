<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class UserDossierHistory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'user_dossier_histories';

    protected $fillable = [
        'user_id',
        'dossier_id',
        'reference',
        'action',
        'module',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dossier()
    {
        return $this->belongsTo(Dossier::class);
    }
}
