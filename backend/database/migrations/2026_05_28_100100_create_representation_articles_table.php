<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('representation_articles', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('representation_entry_id')->constrained('representation_entries')->onDelete('cascade');
            $table->foreignUuid('dossier_id')->constrained()->onDelete('cascade');
            $table->string('designation', 500);
            $table->string('position_tarifaire', 20)->nullable();
            $table->decimal('quantite', 12, 2)->default(1);
            $table->decimal('poids', 12, 2)->default(0);
            $table->decimal('fob', 14, 2)->default(0);
            $table->timestamps();

            $table->index('representation_entry_id');
            $table->index('dossier_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('representation_articles');
    }
};
