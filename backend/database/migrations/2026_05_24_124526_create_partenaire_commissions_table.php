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
        Schema::create('partenaire_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('bureau_id', 50);
            $table->string('type_dossier_id', 50);
            $table->enum('type_commission', ['fixe', 'pourcentage']);
            $table->decimal('valeur_commission', 10, 2);
            $table->timestamps();

            // We can add a unique constraint so a user has only one commission config per dossier type per bureau
            $table->unique(['user_id', 'bureau_id', 'type_dossier_id'], 'partenaire_commissions_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partenaire_commissions');
    }
};
