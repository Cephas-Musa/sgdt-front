<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Enums\DossierStatus;

class Dossier extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'reference',
        'reference_douane',
        'type',
        'importateur',
        'exportateur',
        'declarant',
        'nif',
        'dra',
        't1',
        'vehicule',
        'plaque',
        'pays',
        'provenance',
        'destination',
        'localisation',
        'type_marchandises',
        'quantite',
        'poids',
        'colis',
        'devise',
        'status',
        'montant',
        'bureau_repr',
        'bureau_id',
        'province',
        'province_id',
        'nombre_declarations',
        'type_dossier_id',
        'metadata',
        'attachments',
        'extra_data',
        'created_by',
        'inspecteur_id',
        'secretary_id',
        'locked_by',
        'locked_at',
        'deleted_by',
        'delete_reason',
    ];

    protected $casts = [
        'status' => DossierStatus::class,
        'locked_at' => 'datetime',
        'metadata' => 'array',
        'attachments' => 'array',
        'extra_data' => 'array',
    ];

    public function typeDossier(): BelongsTo
    {
        return $this->belongsTo(TypeDossier::class, 'type_dossier_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function inspecteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspecteur_id');
    }

    public function secretary(): BelongsTo
    {
        return $this->belongsTo(User::class, 'secretary_id');
    }

    public function lockedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'locked_by');
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'target_id')->where('module', 'dossier');
    }

    public function workflows(): HasMany
    {
        return $this->hasMany(DossierWorkflow::class);
    }

    public function timelines(): HasMany
    {
        return $this->hasMany(DossierTimeline::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(DossierAssignment::class);
    }

    public function validations(): HasMany
    {
        return $this->hasMany(DossierValidation::class);
    }

    public function anomalies(): HasMany
    {
        return $this->hasMany(DossierAnomaly::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DossierVersion::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DossierDocument::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(DossierMessage::class);
    }

    public function barriere_entries(): HasMany
    {
        return $this->hasMany(BarriereEntry::class);
    }

    public function empty_manifests(): HasMany
    {
        return $this->hasMany(EmptyManifest::class);
    }

    public function mouvements(): HasMany
    {
        return $this->hasMany(Mouvement::class);
    }

    public function vracs(): HasMany
    {
        return $this->hasMany(Vrac::class);
    }

    public function decharges(): HasMany
    {
        return $this->hasMany(Decharge::class);
    }

    public function mouvementsStockage(): HasMany
    {
        return $this->hasMany(MouvementStockage::class);
    }

    public function colisages(): HasMany
    {
        return $this->hasMany(RapportColisage::class);
    }

    public function representationEntry(): HasOne
    {
        return $this->hasOne(RepresentationEntry::class);
    }

    public function typingDocsDirect(): HasMany
    {
        return $this->hasMany(TypingDocDirect::class);
    }

    public function typingDocsTranshipment(): HasMany
    {
        return $this->hasMany(TypingDocTranshipment::class);
    }

    public function itEntries(): HasMany
    {
        return $this->hasMany(ItEntry::class);
    }

    /**
     * Format data for display: empty values become "-"
     * Includes declaration and title details with proper structure
     */
    public function getFormattedDataAttribute(): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference ?? '-',
            'importateur' => $this->importateur ?? '-',
            'exportateur' => $this->exportateur ?? '-',
            'declarant' => $this->declarant ?? '-',
            'nif' => $this->nif ?? '-',
            'dra' => $this->dra ?? '-',
            't1' => $this->t1 ?? '-',
            'vehicule' => $this->vehicule ?? '-',
            'plaque' => $this->plaque ?? '-',
            'pays' => $this->pays ?? '-',
            'provenance' => $this->provenance ?? '-',
            'destination' => $this->destination ?? '-',
            'localisation' => $this->localisation ?? '-',
            'type_marchandises' => $this->type_marchandises ?? '-',
            'quantite' => $this->quantite ?? '-',
            'poids' => $this->poids ?? '-',
            'colis' => $this->colis ?? '-',
            'status' => $this->status?->value ?? '-',
            'date' => $this->created_at?->format('Y-m-d') ?? '-',
            'extra_data' => $this->formatExtraData(),
        ];
    }

    /**
     * Format extra_data with declarations and titles details
     */
    private function formatExtraData(): array
    {
        $extra = is_array($this->extra_data) ? $this->extra_data : [];

        // Get declarations and titres safely
        $declarations = [];
        $titres = [];

        if (isset($extra['declarations_details']) && is_array($extra['declarations_details'])) {
            $declarations = $extra['declarations_details'];
        }

        if (isset($extra['titres_details']) && is_array($extra['titres_details'])) {
            $titres = $extra['titres_details'];
        }

        // Build other_data by excluding known fields
        $knownFields = [
            'nombre_declarations_attendues', 'nombre_declarations', 'nombre_titres',
            'declarations_details', 'titres_details', 'reference_titre', 'date_titre',
            'reference_t1', 'date_t1', 'reference_douane', 'date_reference_douane',
            'date_debut', 'date_fin'
        ];

        $otherData = [];
        foreach ($extra as $key => $value) {
            if (!in_array($key, $knownFields)) {
                $otherData[$key] = $value;
            }
        }

        return [
            'nombre_declarations_attendues' => $extra['nombre_declarations_attendues'] ?? 0,
            'nombre_declarations' => $extra['nombre_declarations'] ?? 0,
            'nombre_titres' => $extra['nombre_titres'] ?? 0,
            'declarations_details' => $this->formatDeclarations($declarations),
            'titres_details' => $this->formatTitres($titres),
            'reference_titre' => $extra['reference_titre'] ?? '-',
            'date_titre' => $extra['date_titre'] ?? '-',
            'reference_t1' => $extra['reference_t1'] ?? '-',
            'date_t1' => $extra['date_t1'] ?? '-',
            'reference_douane' => $extra['reference_douane'] ?? '-',
            'date_reference_douane' => $extra['date_reference_douane'] ?? '-',
            'date_debut' => $extra['date_debut'] ?? '-',
            'date_fin' => $extra['date_fin'] ?? '-',
            'other_data' => $otherData,
        ];
    }

    /**
     * Format declarations with "-" for empty values
     */
    private function formatDeclarations(array $declarations): array
    {
        if (empty($declarations)) return [];

        return array_map(function($decl, $index) {
            // Handle both array and object access
            $numero = is_array($decl) ? ($decl['numero'] ?? '-') : ($decl->numero ?? '-');
            $date = is_array($decl) ? ($decl['date'] ?? '-') : ($decl->date ?? '-');

            return [
                'index' => $index + 1,
                'numero' => $numero,
                'date' => $date,
            ];
        }, $declarations, array_keys($declarations));
    }

    /**
     * Format titres with "-" for empty values
     */
    private function formatTitres(array $titres): array
    {
        if (empty($titres)) return [];

        return array_map(function($titre, $index) {
            // Handle both array and object access
            $numero = is_array($titre) ? ($titre['numero'] ?? '-') : ($titre->numero ?? '-');
            $date = is_array($titre) ? ($titre['date'] ?? '-') : ($titre->date ?? '-');

            return [
                'index' => $index + 1,
                'numero' => $numero,
                'date' => $date,
            ];
        }, $titres, array_keys($titres));
    }
}
