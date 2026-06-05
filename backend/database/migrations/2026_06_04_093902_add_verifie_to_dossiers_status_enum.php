<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE dossiers MODIFY COLUMN status ENUM('brouillon','attente_paiement','paye','validation_inspecteur','en_cours','controle','verifie','verification','appurement_administratif','appurement_final','termine') NOT NULL DEFAULT 'brouillon'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE dossiers MODIFY COLUMN status ENUM('brouillon','attente_paiement','paye','validation_inspecteur','en_cours','controle','verification','appurement_administratif','appurement_final','termine') NOT NULL DEFAULT 'brouillon'");
    }
};
