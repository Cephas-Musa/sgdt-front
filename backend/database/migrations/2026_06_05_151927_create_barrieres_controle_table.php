<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barrieres_controle', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('entite');
            $table->foreignId('brigadier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('active');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barrieres_controle');
    }
};
