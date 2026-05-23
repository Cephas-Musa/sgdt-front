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
        Schema::create('apurements', function (Blueprint $table) {
            $table->id();
            $table->string('dossier_id', 50)->unique();
            $table->foreignId('secretaire_id')->constrained('users')->onDelete('cascade');
            $table->string('ref_douane', 100);
            $table->date('date_apurement');
            $table->timestamp('date_soumission')->useCurrent();
            $table->string('status', 50)->default('soumis'); // soumis, valide, rejete
            $table->timestamps();

            $table->foreign('dossier_id')->references('id')->on('dossiers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apurements');
    }
};
