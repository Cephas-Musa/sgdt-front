<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barrier_commissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('barriere_code', 50);
            $table->foreignId('typing_operator_id')->constrained('users')->onDelete('cascade');
            $table->string('reference_document', 100);
            $table->enum('document_type', ['direct', 'transhipment', 'it', 'manifest']);
            $table->decimal('montant_base', 12, 2)->default(0);
            $table->decimal('taux', 5, 2)->default(0);
            $table->decimal('commission', 12, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->enum('statut', ['calculee', 'approuvee', 'payee', 'annulee'])->default('calculee');
            $table->timestamp('date_calcul')->useCurrent();
            $table->timestamp('date_paiement')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('barriere_code');
            $table->index('typing_operator_id');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barrier_commissions');
    }
};
