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
        Schema::table('mouvements', function (Blueprint $table) {
            $table->uuid('dossier_id')->nullable()->after('id')->constrained('dossiers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mouvements', function (Blueprint $table) {
            $table->dropForeign(['dossier_id']);
            $table->dropColumn('dossier_id');
        });
    }
};
