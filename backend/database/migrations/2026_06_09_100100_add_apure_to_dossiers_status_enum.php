<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE dossiers MODIFY COLUMN status ENUM('brouillon','attente_paiement','paye','validation_inspecteur','en_cours','controle','verifie','verification','appurement_administratif','appurement_final','termine','apure') NOT NULL DEFAULT 'brouillon'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE dossiers MODIFY COLUMN status ENUM('brouillon','attente_paiement','paye','validation_inspecteur','en_cours','controle','verifie','verification','appurement_administratif','appurement_final','termine') NOT NULL DEFAULT 'brouillon'");
    }
};
