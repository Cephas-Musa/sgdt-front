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
        Schema::create('empty_manifests', function (Blueprint $table) {
            $table->id();
            $table->string('manifest_number', 100)->unique();
            $table->string('plaque', 50);
            $table->string('chauffeur', 255);
            $table->string('pays_provenance', 10);
            $table->string('pays_destination', 10);
            $table->timestamp('date_declaration');
            $table->string('bureau_id', 50);
            $table->enum('status', ['cree', 'paye', 'valide', 'barriere_1', 'barriere_2', 'sorti', 'termine'])->default('cree');
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empty_manifests');
    }
};
