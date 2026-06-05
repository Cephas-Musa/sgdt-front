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
        Schema::create('dechargements', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->uuid('dossier_id')->nullable()->index();
            $table->string('entrepot_id', 50)->nullable()->index();
            $table->integer('quantite_attendue')->default(0);
            $table->integer('quantite_reelle')->default(0);
            $table->text('observations')->nullable();
            $table->string('status')->default('en_attente');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('date_decharge')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dechargements');
    }
};
