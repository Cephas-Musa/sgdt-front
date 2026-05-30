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
        Schema::create('user_dossier_histories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->uuid('dossier_id')->index();
            $table->string('reference');
            $table->string('action'); // consultation, modification, validation...
            $table->string('module')->nullable();
            $table->timestamps();

            $table->foreign('dossier_id')->references('id')->on('dossiers')->onDelete('cascade');
            
            // Un utilisateur ne devrait pas avoir la même action à la même seconde pour le même dossier, 
            // mais on va garder ça simple sans contrainte unique composite trop stricte.
            $table->index(['user_id', 'dossier_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_dossier_histories');
    }
};
