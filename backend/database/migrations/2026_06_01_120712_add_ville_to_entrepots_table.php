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
        Schema::table('entrepots', function (Blueprint $table) {
            $table->string('ville', 100)->nullable()->after('bureau');
        });
    }

    public function down(): void
    {
        Schema::table('entrepots', function (Blueprint $table) {
            $table->dropColumn('ville');
        });
    }
};
