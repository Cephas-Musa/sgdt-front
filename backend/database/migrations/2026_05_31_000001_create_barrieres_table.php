<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barrieres', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('code', 50)->unique();
            $table->string('nom', 200);
            $table->string('type', 50)->default('entree')->comment('entree, sortie, entrepot, mixte');
            $table->string('localisation', 200)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('pays', 100)->default('RDC');
            $table->decimal('balance_financiere', 14, 2)->default(0);
            $table->string('status', 50)->default('actif');
            $table->decimal('commission_taux', 5, 2)->default(0)->comment('Taux de commission %');
            $table->enum('commission_type', ['fixe', 'pourcentage', 'degresif'])->default('pourcentage');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barrieres');
    }
};
