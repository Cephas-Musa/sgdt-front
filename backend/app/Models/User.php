<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'phone_number',
        'password',
        'role',
        'full_name',
        'email',
        'bureau',
        'province',
        'bureau_id',
        'province_id',
        'created_by',
        'matricule',
        'phone_verified_at',
        'parent_id',
        'wallet_balance',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function conversations(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Conversation::class);
    }

    public function roles(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function hasRole(string $roleSlug): bool
    {
        return $this->roles()->where('slug', $roleSlug)->exists();
    }

    public function hasPermission(string $permissionSlug): bool
    {
        return $this->roles()->whereHas('permissions', function ($q) use ($permissionSlug) {
            $q->where('slug', $permissionSlug);
        })->exists();
    }

    public function messages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function dossiers(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Dossier::class);
    }

    public function transactions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function supervisor(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function subordinates(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class, 'parent_id');
    }

    public function creator(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function bureau(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(BureauDouanier::class, 'bureau_id', 'id');
    }

    public function province(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(DirectionProvinciale::class, 'province_id', 'id');
    }

    // Relations par rôle

    public function inspecteur(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'inspecteur_id');
    }

    public function secretairesInspecteur(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class, 'inspecteur_id');
    }

    public function chefBureauRepresentation(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'chef_bureau_representation_id');
    }

    public function operateursSaisie(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class, 'chef_bureau_representation_id');
    }

    public function chefBarriere(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'chef_barriere_id');
    }

    public function typingOperators(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class, 'chef_barriere_id');
    }

    public function chefEntrepot(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'chef_entrepot_id');
    }

    public function agentsPointage(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class, 'chef_entrepot_id');
    }

    public function chefVerification(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'chef_verification_id');
    }

    public function verificateurs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class, 'chef_verification_id');
    }

    public function barriere(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Barriere::class, 'barriere_id', 'id');
    }

    public function entrepot(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Entrepot::class, 'entrepot_id', 'id');
    }

    public function bureauRepresentation(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(BureauRepresentation::class, 'bureau_representation_id', 'id');
    }

    // Alertes
    public function alertes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Alerte::class, 'recipient_id');
    }

    // Mouvements
    public function mouvements(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Mouvement::class);
    }

    public function mouvementsStockage(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MouvementStockage::class);
    }

    // Appurements
    public function appurements(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Apurement::class);
    }

    // Audit
    public function auditLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    // Historique dossiers (Consultations, Actions)
    public function dossierHistories(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UserDossierHistory::class)->orderBy('created_at', 'desc');
    }

    /**
     * Vérifier si l'utilisateur a permission pour une action
     */
    public function canCreateRole(string $role): bool
    {
        $roleHierarchy = [
        'super_admin' => [
            'directeur_general', 'directeur_provincial', 'inspecteur',
            'inspecteur_chef_bureau', 'secretaire_inspecteur',
            'chef_bureau_representation', 'operateur_saisie',
            'chef_barriere', 'typing_operator', 'brigadier_barriere_entree',
            'brigadier_barriere_sortie', 'chef_entrepot_douane', 'chef_entrepot_prive',
            'agent_pointage', 'verificateur', 'chef_verification', 'agent_controle',
            'brigadier_controle',
        ],
            'directeur_general' => ['directeur_provincial', 'inspecteur', 'inspecteur_chef_bureau', 'agent_controle'],
            'directeur_provincial' => ['inspecteur', 'inspecteur_chef_bureau', 'agent_controle'],
            'inspecteur_chef_bureau' => ['secretaire_inspecteur'],
            'inspecteur' => ['secretaire_inspecteur'],
            'chef_bureau_representation' => ['operateur_saisie'],
            'chef_barriere' => ['typing_operator'],
            'chef_entrepot_douane' => ['agent_pointage'],
            'chef_entrepot_prive' => ['agent_pointage'],
            'chef_verification' => ['verificateur'],
        ];

        $allowedRoles = $roleHierarchy[$this->role] ?? [];
        return in_array($role, $allowedRoles);
    }

    /**
     * Obtenir la chaîne hiérarchique complète
     */
    public function getHierarchyChain(): array
    {
        $chain = [$this];
        $current = $this;

        while ($current->supervisor) {
            $current = $current->supervisor;
            $chain[] = $current;
        }

        return $chain;
    }

    /**
     * Tous les subordonnés récursivement
     */
    public function getAllSubordinates(): array
    {
        $all = [];
        foreach ($this->subordinates as $sub) {
            $all[] = $sub;
            $all = array_merge($all, $sub->getAllSubordinates());
        }
        return $all;
    }
}
