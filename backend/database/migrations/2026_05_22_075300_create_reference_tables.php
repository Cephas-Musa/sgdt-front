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
        Schema::create('directions_provinciales', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->integer('numero');
            $table->string('denomination');
            $table->integer('nombre_bureaux')->default(0);
            $table->string('directeur');
            $table->string('telephone')->nullable();
            $table->string('email')->nullable();
            $table->string('date_creation')->nullable();
            $table->timestamps();
        });

        Schema::create('bureaux_douaniers', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('code', 50);
            $table->string('denomination');
            $table->string('icb')->nullable();
            $table->string('province')->nullable();
            $table->decimal('manifest_price', 12, 2)->default(0.00);
            $table->timestamps();
        });

        Schema::create('bureaux_representation', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('code', 50);
            $table->string('denomination');
            $table->string('type', 20); // entree, sortie
            $table->string('ville');
            $table->string('pays');
            $table->string('status', 20)->default('actif');
            $table->timestamps();
        });

        Schema::create('locodes', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('code', 50);
            $table->string('designation');
            $table->string('code_pays', 10);
            $table->string('denomination');
            $table->timestamps();
        });

        Schema::create('pays', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('code', 10);
            $table->string('designation');
            $table->timestamps();
        });

        Schema::create('devises', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('code_pays', 10);
            $table->string('code_devise', 10);
            $table->string('denomination');
            $table->timestamps();
        });

        Schema::create('entrepots', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('code', 50);
            $table->string('nom');
            $table->string('bureau');
            $table->integer('capacite');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entrepots');
        Schema::dropIfExists('devises');
        Schema::dropIfExists('pays');
        Schema::dropIfExists('locodes');
        Schema::dropIfExists('bureaux_representation');
        Schema::dropIfExists('bureaux_douaniers');
        Schema::dropIfExists('directions_provinciales');
    }
};
