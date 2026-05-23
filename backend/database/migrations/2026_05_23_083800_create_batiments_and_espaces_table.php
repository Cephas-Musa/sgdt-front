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
        Schema::create('batiments', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('entrepot_id', 50)->nullable();
            $table->timestamps();
        });

        Schema::create('espaces_stockage', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->integer('capacite')->default(0);
            $table->integer('occupe')->default(0);
            $table->string('status')->default('actif');
            $table->foreignId('batiment_id')->constrained('batiments')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('espaces_stockage');
        Schema::dropIfExists('batiments');
    }
};
