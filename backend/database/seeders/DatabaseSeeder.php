<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\DirectionProvinciale;
use App\Models\BureauDouanier;
use App\Models\BureauRepresentation;
use App\Models\Locode;
use App\Models\Pays;
use App\Models\Devise;
use Database\Seeders\BarriereSeeder;
use App\Models\Entrepot;
use App\Models\Dossier;
use App\Models\Article;
use App\Models\Transaction;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Réinitialisation complète — seul le Superadmin est conservé.
     */
    public function run(): void
    {
        // ─── Nettoyage complet (ordre respectant les FK) ───────────────────
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Article::truncate();
        Transaction::truncate();
        Dossier::truncate();
        // Supprimer TOUS les utilisateurs sauf le superadmin s'il existe déjà
        User::where('phone_number', '!=', '+243813478556')->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ─── 1. Superadmin (seul compte utilisateur) ───────────────────────
        User::updateOrCreate(
            ['phone_number' => '+243813478556'],
            [
                'password'          => Hash::make('Dragon@2004'),
                'role'              => 'super_admin',
                'full_name'         => 'Super Administrateur SGDT',
                'bureau'            => null,
                'province'          => null,
                'matricule'         => 'SA-2026-0001',
                'phone_verified_at' => now(),
                'wallet_balance'    => 0.00,
            ]
        );

        // ─── 5. Locodes ────────────────────────────────────────────────────
        Locode::truncate();
        $locodes = [
            ['id' => 'l1', 'code' => 'UGKLA', 'designation' => 'Kampala',       'code_pays' => 'UG', 'denomination' => 'OUGANDA'],
            ['id' => 'l2', 'code' => 'KENBO', 'designation' => 'Nairobi',        'code_pays' => 'KE', 'denomination' => 'KENYA'],
            ['id' => 'l3', 'code' => 'TZDAR', 'designation' => 'Dar es Salaam', 'code_pays' => 'TZ', 'denomination' => 'TANZANIE'],
        ];
        foreach ($locodes as $l) {
            Locode::updateOrCreate(['id' => $l['id']], $l);
        }

        // ─── 6. Pays ───────────────────────────────────────────────────────
        Pays::truncate();
        $pays = [
            ['id' => 'p1', 'code' => 'UG', 'designation' => 'OUGANDA'],
            ['id' => 'p2', 'code' => 'KE', 'designation' => 'KENYA'],
            ['id' => 'p3', 'code' => 'RW', 'designation' => 'RWANDA'],
            ['id' => 'p4', 'code' => 'TZ', 'designation' => 'TANZANIE'],
            ['id' => 'p5', 'code' => 'BI', 'designation' => 'BURUNDI'],
        ];
        foreach ($pays as $p) {
            Pays::updateOrCreate(['id' => $p['id']], $p);
        }

        // ─── 7. Devises ────────────────────────────────────────────────────
        Devise::truncate();
        $devises = [
            ['id' => 'd1', 'code_pays' => 'US', 'code_devise' => 'USD', 'denomination' => 'Dollar Américain'],
            ['id' => 'd2', 'code_pays' => 'EU', 'code_devise' => 'EUR', 'denomination' => 'Euro'],
            ['id' => 'd3', 'code_pays' => 'CD', 'code_devise' => 'CDF', 'denomination' => 'Franc Congolais'],
            ['id' => 'd4', 'code_pays' => 'UG', 'code_devise' => 'UGX', 'denomination' => 'Shilling Ougandais'],
            ['id' => 'd5', 'code_pays' => 'KE', 'code_devise' => 'KES', 'denomination' => 'Shilling Kenyan'],
        ];
        foreach ($devises as $d) {
            Devise::updateOrCreate(['id' => $d['id']], $d);
        }

        // Aucun dossier, aucune transaction — base vierge pour démarrage réel
        // ─── Barrières Étrangères ────────────────────────────────────────────
        $this->call(BarriereSeeder::class);

        $this->command->info('✅ Base de données réinitialisée. Seul le Superadmin (+243813478556) est présent.');
    }
}
