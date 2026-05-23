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
        Schema::table('users', function (Blueprint $table) {
            // Relations spécifiques par rôle
            $table->foreignId('inspecteur_id')->nullable()->constrained('users')->nullOnDelete(); // Pour secretaire_inspecteur
            $table->string('bureau_representation_id', 50)->nullable(); // Pour operateur_saisie, chef_bureau_representation
            $table->string('barriere_id', 50)->nullable(); // Pour typing_operator, chef_barriere
            $table->string('entrepot_id', 50)->nullable(); // Pour agent_pointage
            $table->foreignId('chef_entrepot_id')->nullable()->constrained('users')->nullOnDelete(); // Pour agent_pointage
            $table->foreignId('chef_barriere_id')->nullable()->constrained('users')->nullOnDelete(); // Pour typing_operator
            $table->foreignId('chef_bureau_representation_id')->nullable()->constrained('users')->nullOnDelete(); // Pour operateur_saisie
            $table->foreignId('chef_verification_id')->nullable()->constrained('users')->nullOnDelete(); // Pour verificateur

            // Permissions additionnelles
            $table->boolean('can_create_reports')->default(false);
            $table->boolean('can_manage_payments')->default(false);
            $table->boolean('can_manage_warehouse')->default(false);
            $table->boolean('can_manage_barriers')->default(false);
            $table->boolean('can_verify_dossiers')->default(false);

            // Indices pour améliorer les requêtes
            $table->index('inspecteur_id');
            $table->index('bureau_representation_id');
            $table->index('barriere_id');
            $table->index('entrepot_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeignKey(['inspecteur_id']);
            $table->dropForeignKey(['chef_entrepot_id']);
            $table->dropForeignKey(['chef_barriere_id']);
            $table->dropForeignKey(['chef_bureau_representation_id']);
            $table->dropForeignKey(['chef_verification_id']);

            $table->dropColumn([
                'inspecteur_id',
                'bureau_representation_id',
                'barriere_id',
                'entrepot_id',
                'chef_entrepot_id',
                'chef_barriere_id',
                'chef_bureau_representation_id',
                'chef_verification_id',
                'can_create_reports',
                'can_manage_payments',
                'can_manage_warehouse',
                'can_manage_barriers',
                'can_verify_dossiers',
            ]);
        });
    }
};
