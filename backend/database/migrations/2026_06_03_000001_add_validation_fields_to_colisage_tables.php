<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('colisage_affectations', function (Blueprint $table) {
            if (!Schema::hasColumn('colisage_affectations', 'chef_entrepot_douane_id')) {
                $table->foreignId('chef_entrepot_douane_id')->nullable()->constrained('users')->nullOnDelete()->after('agent_id');
            }
            if (!Schema::hasColumn('colisage_affectations', 'statut')) {
                $table->string('statut', 50)->default('affecte')->after('date_affectation');
            }
        });

        Schema::table('rapports_colisage', function (Blueprint $table) {
            if (!Schema::hasColumn('rapports_colisage', 'validated_by')) {
                $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete()->after('notes_chef');
            }
            if (!Schema::hasColumn('rapports_colisage', 'validated_at')) {
                $table->timestamp('validated_at')->nullable()->after('validated_by');
            }
            if (!Schema::hasColumn('rapports_colisage', 'motif_rejet')) {
                $table->text('motif_rejet')->nullable()->after('validated_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('rapports_colisage', function (Blueprint $table) {
            if (Schema::hasColumn('rapports_colisage', 'validated_by')) {
                $table->dropForeign(['validated_by']);
                $table->dropColumn(['validated_by', 'validated_at', 'motif_rejet']);
            }
        });

        Schema::table('colisage_affectations', function (Blueprint $table) {
            if (Schema::hasColumn('colisage_affectations', 'chef_entrepot_douane_id')) {
                $table->dropForeign(['chef_entrepot_douane_id']);
            }
            if (Schema::hasColumn('colisage_affectations', 'chef_entrepot_douane_id')) {
                $table->dropColumn(['chef_entrepot_douane_id', 'statut']);
            }
        });
    }
};
