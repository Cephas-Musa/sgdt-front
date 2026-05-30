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
            $table->uuid('type_dossier_id')->nullable()->after('type');
            $table->foreign('type_dossier_id')->references('id')->on('types_dossiers')->onDelete('set null');
            
            $table->json('metadata')->nullable()->after('devise');
            $table->json('attachments')->nullable()->after('metadata');
            
            // Adjust default status if we need it to be 'attente_paiement', 
            // though it's already an ENUM so we don't strictly need to alter the enum here 
            // if we handle it in code. Let's let code handle default status.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dossiers', function (Blueprint $table) {
            $table->dropForeign(['type_dossier_id']);
            $table->dropColumn('type_dossier_id');
            $table->dropColumn('metadata');
            $table->dropColumn('attachments');
        });
    }
};
