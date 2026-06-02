<?php

namespace App\Services;

use App\Models\Dossier;
use App\Models\RepresentationEntry;

class DossierSyncService
{
    /**
     * Recherche dynamiquement les données du Bureau de Représentation associées
     * à une référence DRA donnée, sans effectuer aucune modification en base de données.
     * Cette méthode sert uniquement pour la consultation en lecture seule.
     */
    public function findRepresentationDataByDra(?string $draReference): ?array
    {
        if (empty($draReference)) {
            return null;
        }

        // Normaliser la référence DRA pour ignorer les espaces et les tirets lors de la recherche
        $normalizedDra = strtoupper(str_replace(['-', ' '], '', $draReference));

        $representation = RepresentationEntry::with(['articles', 'operateur'])
            ->whereRaw("REPLACE(REPLACE(UPPER(dra_reference), '-', ''), ' ', '') = ?", [$normalizedDra])
            ->first();

        if (!$representation) {
            return null;
        }

        return [
            'representation_data' => $representation->toArray(),
            'representation_articles' => $representation->articles->toArray(),
            // Optionnel: Historique ou Timeline si nécessaire
            'representation_history' => [] 
        ];
    }
}
