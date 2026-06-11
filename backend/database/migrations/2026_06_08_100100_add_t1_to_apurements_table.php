<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('apurements', function (Blueprint $table) {
            $table->string('t1', 100)->nullable()->after('date_apurement');
        });
    }

    public function down(): void
    {
        Schema::table('apurements', function (Blueprint $table) {
            $table->dropColumn('t1');
        });
    }
};
