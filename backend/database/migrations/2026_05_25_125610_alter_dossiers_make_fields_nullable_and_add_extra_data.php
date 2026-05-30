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
        Schema::table('dossiers', function (Blueprint $table) {
            $table->string('reference_douane', 50)->nullable()->change();
            $table->string('type', 50)->nullable()->change();
            $table->string('importateur', 255)->nullable()->change();
            $table->string('declarant', 255)->nullable()->change();
            $table->string('dra', 50)->nullable()->change();
            $table->string('t1', 50)->nullable()->change();
            $table->string('vehicule', 100)->nullable()->change();
            $table->string('plaque', 50)->nullable()->change();
            $table->string('pays', 100)->nullable()->change();
            $table->string('provenance', 100)->nullable()->change();
            $table->string('destination', 100)->nullable()->change();
            $table->string('localisation', 255)->nullable()->change();
            $table->string('type_marchandises', 255)->nullable()->change();
            $table->integer('quantite')->nullable()->change();
            $table->decimal('poids', 12, 2)->nullable()->change();
            $table->integer('colis')->nullable()->change();
            $table->decimal('montant', 12, 2)->nullable()->change();
            
            if (!Schema::hasColumn('dossiers', 'extra_data')) {
                $table->json('extra_data')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dossiers', function (Blueprint $table) {
            if (Schema::hasColumn('dossiers', 'extra_data')) {
                $table->dropColumn('extra_data');
            }
        });
    }
};
