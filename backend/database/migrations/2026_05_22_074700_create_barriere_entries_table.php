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
        Schema::create('barriere_entries', function (Blueprint $table) {
            $table->id();
            $table->string('reference_passage', 50)->unique();
            $table->string('dossier_id', 50);
            $table->string('barriere_name', 100);
            $table->foreignId('agent_id')->constrained('users')->onDelete('restrict');
            $table->timestamp('date_passage');
            $table->string('status', 50); // conforme, litige, suspect
            $table->text('observations')->nullable();
            $table->timestamps();

            $table->foreign('dossier_id')->references('id')->on('dossiers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barriere_entries');
    }
};
