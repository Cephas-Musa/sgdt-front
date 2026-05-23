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
        Schema::create('colisage_affectations', function (Blueprint $table) {
            $table->id();
            $table->string('dossier_id', 50);
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('date_affectation')->useCurrent();
            $table->timestamps();

            $table->foreign('dossier_id')->references('id')->on('dossiers')->onDelete('cascade');
        });

        Schema::create('rapports_colisage', function (Blueprint $table) {
            $table->id();
            $table->string('dossier_id', 50)->unique();
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('date_creation')->useCurrent();
            $table->timestamp('date_soumission')->nullable();
            $table->json('lignes'); // List of ColisageLigne
            $table->json('lignes_chef')->nullable(); // Modified lines by Chef
            $table->integer('total_quantite');
            $table->decimal('total_poids', 12, 2);
            $table->text('notes')->nullable();
            $table->text('notes_chef')->nullable();
            $table->string('statut', 50)->default('soumis'); // soumis, valide, rejete
            $table->timestamps();

            $table->foreign('dossier_id')->references('id')->on('dossiers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rapports_colisage');
        Schema::dropIfExists('colisage_affectations');
    }
};
