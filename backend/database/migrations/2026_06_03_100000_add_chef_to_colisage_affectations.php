<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Ajouter les colonnes manquantes avec une requête SQL directe pour éviter les conflits
        if (!Schema::hasColumn('colisage_affectations', 'chef_entrepot_douane_id')) {
            DB::statement('ALTER TABLE colisage_affectations ADD COLUMN chef_entrepot_douane_id BIGINT UNSIGNED NULL AFTER agent_id');
            DB::statement('ALTER TABLE colisage_affectations ADD FOREIGN KEY (chef_entrepot_douane_id) REFERENCES users(id) ON DELETE SET NULL');
        }

        if (!Schema::hasColumn('colisage_affectations', 'statut')) {
            DB::statement('ALTER TABLE colisage_affectations ADD COLUMN statut VARCHAR(50) DEFAULT "affecte" AFTER date_affectation');
        }
    }

    public function down(): void
    {
        Schema::table('colisage_affectations', function (Blueprint $table) {
            if (Schema::hasColumn('colisage_affectations', 'chef_entrepot_douane_id')) {
                $table->dropForeign(['chef_entrepot_douane_id']);
                $table->dropColumn('chef_entrepot_douane_id');
            }

            if (Schema::hasColumn('colisage_affectations', 'statut')) {
                $table->dropColumn('statut');
            }
        });
    }
};
