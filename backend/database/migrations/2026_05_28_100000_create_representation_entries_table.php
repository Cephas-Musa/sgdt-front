<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('representation_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('dossier_id')->constrained()->onDelete('cascade');
            $table->foreignId('operateur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('bureau_repr_id', 50)->nullable(); // code du bureau repr
            $table->string('importateur', 255)->nullable();
            $table->string('nif', 50)->nullable();
            $table->string('bureau_etranger_code', 20)->nullable();
            $table->string('bureau_etranger_nom', 255)->nullable();
            $table->string('dra_reference', 100)->nullable();
            $table->date('dra_date')->nullable();
            $table->string('t1_reference', 100)->nullable();
            $table->date('t1_date')->nullable();
            $table->string('immatriculation_avant', 50)->nullable();
            $table->string('immatriculation_arriere', 50)->nullable();
            $table->string('devise', 3)->default('USD');
            $table->string('pays_provenance_code', 10)->nullable();
            $table->string('pays_provenance_nom', 100)->nullable();
            $table->string('numero_conteneur', 100)->nullable();
            $table->integer('container_20')->default(0);
            $table->integer('container_40')->default(0);
            $table->string('incoterm', 10)->nullable();
            $table->string('bureau_sortie_code', 20)->nullable();
            $table->string('bureau_sortie_nom', 255)->nullable();
            $table->decimal('fob_total', 14, 2)->default(0);
            $table->enum('status', ['brouillon', 'soumis', 'valide', 'rejete'])->default('brouillon');
            $table->text('observations')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('dossier_id');
            $table->index('operateur_id');
            $table->index('t1_reference');
            $table->index('dra_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('representation_entries');
    }
};
