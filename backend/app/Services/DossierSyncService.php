<?php

namespace App\Services;

use App\Models\Dossier;
use App\Models\RepresentationEntry;
use App\Models\DossierTimeline;
use App\Models\DossierAnomaly;
use Illuminate\Support\Facades\DB;
use App\Models\Notification;

class DossierSyncService
{
    /**
     * Attempts to find a matching RepresentationEntry by DRA and link it to the given Dossier.
     */
    public function syncDossierWithRepresentation(Dossier $dossier): void
    {
        $dra = $dossier->dra;
        if (empty($dra)) {
            return;
        }

        // Find representation entry matching the DRA reference, ignoring hyphens, spaces, and case
        $normalizedDra = strtoupper(str_replace(['-', ' '], '', $dra));
        $representation = RepresentationEntry::whereRaw("REPLACE(REPLACE(UPPER(dra_reference), '-', ''), ' ', '') = ?", [$normalizedDra])->first();

        if ($representation) {
            $this->linkRepresentationToDossier($dossier, $representation);
        }
    }

    /**
     * Attempts to find a matching Dossier by DRA and link the given RepresentationEntry to it.
     */
    public function syncRepresentationWithDossier(RepresentationEntry $representation): void
    {
        $dra = $representation->dra_reference;
        if (empty($dra)) {
            return;
        }

        // Find inspecteur dossier matching the DRA reference, ignoring hyphens, spaces, and case
        $normalizedDra = strtoupper(str_replace(['-', ' '], '', $dra));
        $dossier = Dossier::whereRaw("REPLACE(REPLACE(UPPER(dra), '-', ''), ' ', '') = ?", [$normalizedDra])
            ->whereHas('creator', function ($q) {
                // Ensure it's an inspector dossier
                $q->whereIn('role', ['inspecteur', 'inspecteur_chef', 'secretaire_inspecteur']);
            })->first();

        if ($dossier) {
            $this->linkRepresentationToDossier($dossier, $representation);
        }
    }

    /**
     * Core logic to link and synchronize the two entities.
     */
    public function linkRepresentationToDossier(Dossier $dossier, RepresentationEntry $representation): void
    {
        DB::beginTransaction();
        try {
            // Check if already linked
            if ($representation->dossier_id === $dossier->id) {
                DB::rollBack();
                return;
            }

            // Unlink previous representation dossier if needed
            $oldDossier = null;
            if ($representation->dossier_id && $representation->dossier_id !== $dossier->id) {
                $oldDossier = Dossier::find($representation->dossier_id);
            }

            // Assign new dossier
            $representation->dossier_id = $dossier->id;
            $representation->save();

            // Sync missing core fields (Poids, FOB, etc) into the Inspecteur Dossier
            $dossierUpdated = false;
            
            // Re-calculate weights and FOB from representation articles if main dossier has no articles or weights
            $totalPoids = $representation->articles()->sum('poids');
            $totalFob = $representation->fob_total;

            if (empty($dossier->poids) && $totalPoids > 0) {
                $dossier->poids = $totalPoids;
                $dossierUpdated = true;
            }

            // Sync other fields if empty in dossier
            $fieldsToSync = ['importateur', 'exportateur', 'declarant', 'nif', 'vehicule', 'plaque', 'pays', 'provenance', 'destination'];
            foreach ($fieldsToSync as $field) {
                if (empty($dossier->$field) && !empty($representation->$field)) {
                    $dossier->$field = $representation->$field;
                    $dossierUpdated = true;
                }
            }

            // Save if needed
            if ($dossierUpdated) {
                $dossier->save();
            }

            // Create Timeline Event
            DossierTimeline::create([
                'dossier_id' => $dossier->id,
                'user_id' => auth()->id(),
                'action' => 'liaison_automatique',
                'description' => "Données de représentation liées automatiquement au dossier via la référence E-",
            ]);

            // Conflict Detection
            $this->detectConflicts($dossier, $representation);

            // Handle the old dummy dossier created by Operateur
            if ($oldDossier && $oldDossier->creator && in_array($oldDossier->creator->role, ['operateur_saisie', 'chef_bureau_repr'])) {
                // Transfer other relations if any (e.g. empty manifests, barriere entries)
                // Assuming they are linked to dossier_id, we could transfer them
                
                // Soft delete the old dummy dossier
                $oldDossier->update([
                    'deleted_by' => auth()->id(),
                    'delete_reason' => "Fusion automatique via référence DRA/E- (vers $dossier->reference)",
                ]);
                $oldDossier->delete();
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error("Error linking representation to dossier: " . $e->getMessage());
        }
    }

    /**
     * Compares fields and creates an Anomaly if there's a conflict.
     */
    protected function detectConflicts(Dossier $dossier, RepresentationEntry $representation): void
    {
        $dossierImp = trim(strtolower($dossier->importateur ?? ''));
        $reprImp = trim(strtolower($representation->importateur ?? ''));

        if (!empty($dossierImp) && !empty($reprImp) && $dossierImp !== $reprImp) {
            // Check if anomaly already exists
            $exists = DossierAnomaly::where('dossier_id', $dossier->id)
                ->where('anomaly_type', 'Conflit Importateur')
                ->where('status', 'non_resolu')
                ->exists();

            if (!$exists) {
                $anomaly = DossierAnomaly::create([
                    'dossier_id' => $dossier->id,
                    'user_id' => auth()->id() ?? $dossier->created_by,
                    'anomaly_type' => 'Conflit Importateur',
                    'severity' => 'critique',
                    'description' => "Le nom de l'importateur déclaré par l'inspecteur ({$dossier->importateur}) ne correspond pas à celui de la représentation ({$representation->importateur}).",
                    'status' => 'non_resolu',
                ]);

                // Internal Notification logic
                $this->notifyAnomaly($dossier, $anomaly);
            }
        }
    }

    /**
     * Notifies Inspecteur, DP, and DG about the critical anomaly.
     */
    protected function notifyAnomaly(Dossier $dossier, DossierAnomaly $anomaly): void
    {
        $message = "Une anomalie critique a été détectée sur le dossier {$dossier->reference} : Conflit d'Importateur.";
        
        // Find users to notify
        $rolesToNotify = ['inspecteur_chef', 'directeur_provincial', 'directeur_general', 'super_admin'];
        $users = \App\Models\User::whereIn('role', $rolesToNotify)->get();
        
        // Also notify the specific inspecteur
        if ($dossier->inspecteur_id) {
            $inspecteur = \App\Models\User::find($dossier->inspecteur_id);
            if ($inspecteur && !$users->contains('id', $inspecteur->id)) {
                $users->push($inspecteur);
            }
        }

        foreach ($users as $user) {
            Notification::create([
                'user_id' => $user->id,
                'title' => 'Anomalie Critique',
                'message' => $message,
                'type' => 'anomaly',
                'reference_id' => $anomaly->id,
                'is_read' => false,
            ]);
        }
    }
}
