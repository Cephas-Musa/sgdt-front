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
        Schema::table('alertes', function (Blueprint $table) {
            if (!Schema::hasColumn('alertes', 'triggered_by')) {
                $table->foreignId('triggered_by')->nullable()->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('alertes', 'severity')) {
                $table->string('severity', 20)->default('normal'); // low, normal, high, critical
            }
            if (!Schema::hasColumn('alertes', 'acknowledged_at')) {
                $table->timestamp('acknowledged_at')->nullable();
            }
            if (!Schema::hasColumn('alertes', 'resolved_at')) {
                $table->timestamp('resolved_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('alertes', function (Blueprint $table) {
            if (Schema::hasColumn('alertes', 'triggered_by')) {
                $table->dropForeignKey(['triggered_by']);
                $table->dropColumn('triggered_by');
            }
            if (Schema::hasColumn('alertes', 'severity')) {
                $table->dropColumn('severity');
            }
            if (Schema::hasColumn('alertes', 'acknowledged_at')) {
                $table->dropColumn('acknowledged_at');
            }
            if (Schema::hasColumn('alertes', 'resolved_at')) {
                $table->dropColumn('resolved_at');
            }
        });
    }
};
