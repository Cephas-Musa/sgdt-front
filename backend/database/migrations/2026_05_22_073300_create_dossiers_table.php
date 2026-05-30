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
        Schema::create('dossiers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('reference', 50)->unique();
            $table->string('reference_douane', 50);
            $table->string('type', 50);
            $table->string('importateur', 255);
            $table->string('exportateur', 255)->nullable();
            $table->string('declarant', 255);
            $table->string('nif', 50)->nullable();
            $table->string('dra', 50);
            $table->string('t1', 50);
            $table->string('vehicule', 100);
            $table->string('plaque', 50);
            $table->string('pays', 100);
            $table->string('provenance', 100);
            $table->string('destination', 100);
            $table->string('localisation', 255);
            $table->string('type_marchandises', 255);
            $table->integer('quantite');
            $table->decimal('poids', 12, 2);
            $table->integer('colis');
            $table->string('devise', 3)->default('USD');
            $table->enum('status', [
                'brouillon', 'attente_paiement', 'paye', 'validation_inspecteur', 
                'en_cours', 'controle', 'verification', 'appurement_administratif', 
                'appurement_final', 'termine'
            ])->default('brouillon');
            $table->decimal('montant', 12, 2);
            
            // Locations
            $table->string('bureau_repr', 100)->nullable(); // Keeping for backward compatibility or replace?
            $table->string('bureau_id', 50)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('province_id', 50)->nullable();
            
            $table->integer('nombre_declarations')->default(1);
            
            // Ownership & Hierarchy
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('inspecteur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('secretary_id')->nullable()->constrained('users')->nullOnDelete();
            
            // Locking
            $table->foreignId('locked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('locked_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('reference');
            $table->index('dra');
            $table->index('t1');
            $table->index('status');
            $table->index('inspecteur_id');
            $table->index('bureau_id');
            $table->index('province_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dossiers');
    }
};
