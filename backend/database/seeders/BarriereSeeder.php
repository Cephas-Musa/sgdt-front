<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Barriere;

class BarriereSeeder extends Seeder
{
    /**
     * Seed the application's database with barriers.
     */
    public function run(): void
    {
        $barrieres = [
            [
                'id' => 'b1',
                'code' => 'BKI-001',
                'nom' => 'Barrière Kasindi Entrée',
                'type' => 'entree',
                'localisation' => 'Kasindi',
                'province' => 'NORD-KIVU',
                'pays' => 'RDC',
                'status' => 'actif',
            ],
            [
                'id' => 'b2',
                'code' => 'BMP-001',
                'nom' => 'Barrière Mpondwe Sortie',
                'type' => 'sortie',
                'localisation' => 'Mpondwe',
                'province' => 'NORD-KIVU',
                'pays' => 'OUGANDA',
                'status' => 'actif',
            ],
            [
                'id' => 'b3',
                'code' => 'BGO-001',
                'nom' => 'Barrière Goma Ville',
                'type' => 'entrepot',
                'localisation' => 'Goma',
                'province' => 'NORD-KIVU',
                'pays' => 'RDC',
                'status' => 'actif',
            ],
            [
                'id' => 'b4',
                'code' => 'BBU-001',
                'nom' => 'Barrière Bukavu',
                'type' => 'entree',
                'localisation' => 'Bukavu',
                'province' => 'SUD-KIVU',
                'pays' => 'RDC',
                'status' => 'actif',
            ],
        ];

        foreach ($barrieres as $b) {
            Barriere::updateOrCreate(['id' => $b['id']], $b);
        }

        echo "✅ " . count($barrieres) . " barrières créées/mises à jour.\n";
    }
}
