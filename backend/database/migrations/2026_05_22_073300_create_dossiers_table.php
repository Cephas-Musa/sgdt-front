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
        Schema::create('dossiers', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('reference', 50)->unique();
            $table->string('reference_douane', 50);
            $table->string('type', 50);
            $table->string('importateur', 255);
            $table->string('exportateur', 255)->nullable();
            $table->string('declarant', 255);
            $table->string('nif', 50)->nullable();
            $table->string('dra', 50);
            $table->string('t1', 50);
            $table->string('vehicule', 100);
            $table->string('plaque', 50);
            $table->string('pays', 100);
            $table->string('provenance', 100);
            $table->string('destination', 100);
            $table->string('localisation', 255);
            $table->string('type_marchandises', 255);
            $table->integer('quantite');
            $table->decimal('poids', 12, 2);
            $table->integer('colis');
            $table->string('devise', 3)->default('USD');
            $table->enum('status', ['paye', 'valide', 'en_cours', 'verification', 'apure', 'termine', 'rejete'])->default('paye');
            $table->decimal('montant', 12, 2);
            $table->string('bureau_repr', 100);
            $table->string('province', 100)->nullable();
            $table->integer('nombre_declarations')->default(1);
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dossiers');
    }
};
