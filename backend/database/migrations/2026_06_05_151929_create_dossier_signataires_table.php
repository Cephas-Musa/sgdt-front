<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dossier_signataires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers_controle')->cascadeOnDelete();
            $table->string('type_signataire');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dossier_signataires');
    }
};
