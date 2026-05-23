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
        Schema::create('titre_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mouvement_id')->constrained('mouvements')->onDelete('cascade');
            $table->string('reference_dra', 100);
            $table->date('date_dra');
            $table->string('reference_t1', 100);
            $table->date('date_t1');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('titre_documents');
    }
};
