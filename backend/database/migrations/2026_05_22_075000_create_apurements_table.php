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
            $table->uuid('id')->primary();
            $table->uuid('dossier_id')->index();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type_appurement', ['administratif', 'verification', 'sortie', 'entrepot', 'final'])->default('administratif');
            $table->string('ref_douane', 100)->nullable();
            $table->date('date_apurement')->nullable();
            $table->timestamp('date_soumission')->useCurrent();
            $table->string('status', 50)->default('soumis'); // soumis, valide, rejete
            $table->text('observation')->nullable();
            $table->timestamps();
            $table->softDeletes();

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
