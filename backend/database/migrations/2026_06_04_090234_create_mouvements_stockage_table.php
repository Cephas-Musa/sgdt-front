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
        Schema::create('mouvements_stockage', function (Blueprint $table) {
            $table->id();
            $table->uuid('dossier_id')->nullable()->index();
            $table->string('entrepot_id', 50)->nullable()->index();
            $table->foreignId('espace_id')->nullable()->constrained('espaces_stockage')->nullOnDelete();
            $table->string('type_mouvement')->default('entree');
            $table->integer('quantite')->default(0);
            $table->decimal('poids', 12, 2)->default(0);
            $table->text('observations')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('date_mouvement')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mouvements_stockage');
    }
};
