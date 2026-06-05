<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dossiers_controle', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barriere_id')->nullable()->constrained('barrieres_controle')->nullOnDelete();
            $table->foreignId('brigadier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nom_importateur');
            $table->string('plaque_avant')->nullable();
            $table->string('plaque_arriere')->nullable();
            $table->string('reference_douane');
            $table->timestamp('date_controle')->nullable();
            $table->string('reference_bon_sortie')->nullable();
            $table->string('balle')->nullable();
            $table->boolean('autorisation_speciale')->default(false);
            $table->string('type_autorisation')->nullable();
            $table->string('reference_autorisation')->nullable();
            $table->timestamp('date_autorisation')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dossiers_controle');
    }
};
