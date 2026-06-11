<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('apurements', function (Blueprint $table) {
            $table->foreignId('secretaire_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();

            $table->foreignId('validated_by')->nullable()->after('status')->constrained('users')->nullOnDelete();

            $table->date('date_reference_douane')->nullable()->after('ref_douane');
            $table->string('dra', 100)->nullable()->after('date_reference_douane');
            $table->date('dra_date')->nullable()->after('dra');
            $table->date('t1_date')->nullable()->after('date_apurement');
            $table->string('plaque_avant', 50)->nullable()->after('t1_date');
            $table->string('plaque_arriere', 50)->nullable()->after('plaque_avant');
            $table->datetime('validated_at')->nullable()->after('validated_by');
        });

        Schema::table('dossiers', function (Blueprint $table) {
            $table->string('plaque_avant', 50)->nullable()->after('plaque');
            $table->string('plaque_arriere', 50)->nullable()->after('plaque_avant');
        });
    }

    public function down(): void
    {
        Schema::table('apurements', function (Blueprint $table) {
            $table->dropForeign(['secretaire_id']);
            $table->dropForeign(['validated_by']);
            $table->dropColumn([
                'secretaire_id', 'validated_by', 'date_reference_douane',
                'dra', 'dra_date', 't1_date', 'plaque_avant',
                'plaque_arriere', 'validated_at',
            ]);
        });

        Schema::table('dossiers', function (Blueprint $table) {
            $table->dropColumn(['plaque_avant', 'plaque_arriere']);
        });
    }
};
