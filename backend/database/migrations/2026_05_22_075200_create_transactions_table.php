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
        // Add wallet balance to users
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('wallet_balance', 15, 2)->default(0.00);
        });

        // Main transactions table (for general payment/recharge)
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('reference', 100)->unique();
            $table->string('type', 50); // recharge, paiement, deduction
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('status', 50)->default('reussi'); // reussi, en_attente, echoue
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Partner terrain transactions table
        Schema::create('partenaire_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partenaire_id')->constrained('users')->onDelete('cascade');
            $table->string('dossier_id', 50);
            $table->string('bureau_id', 50);
            $table->string('type_dossier_id', 50);
            $table->decimal('prix_global', 12, 2);
            $table->decimal('part_partenaire', 12, 2);
            $table->decimal('part_systeme', 12, 2);
            $table->timestamp('date')->useCurrent();
            $table->timestamps();

            $table->foreign('dossier_id')->references('id')->on('dossiers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partenaire_transactions');
        Schema::dropIfExists('transactions');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('wallet_balance');
        });
    }
};
