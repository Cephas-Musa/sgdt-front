<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicule_localisations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('plaque', 50);
            $table->string('position', 100); // Barrière entrée, Entrepôt 1, En route, Parking, etc.
            $table->string('status', 50)->default('stationne'); // en_transit, stationne, chargement, dechargement, en_attente
            $table->timestamp('last_seen_at')->useCurrent();
            $table->uuid('dossier_id')->nullable();
            $table->string('chauffeur', 255)->nullable();
            $table->string('importateur', 255)->nullable();
            $table->timestamps();

            $table->foreign('dossier_id')->references('id')->on('dossiers')->nullOnDelete();
            $table->index('plaque');
            $table->index('position');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicule_localisations');
    }
};
