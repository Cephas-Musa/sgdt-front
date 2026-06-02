<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empty_manifests', function (Blueprint $table) {
            $table->string('facture_statut', 50)->default('non_paye')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('empty_manifests', function (Blueprint $table) {
            $table->dropColumn('facture_statut');
        });
    }
};
