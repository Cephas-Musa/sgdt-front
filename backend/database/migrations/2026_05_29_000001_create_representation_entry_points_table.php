<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('representation_entry_points', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('code');
            $table->string('designation');
            $table->string('type')->default('sortie')->comment('sortie or entree_pays');
            $table->string('bureau_repr_id')->nullable();
            $table->foreign('bureau_repr_id')->references('id')->on('bureaux_representation')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('representation_exit_points', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('code');
            $table->string('designation');
            $table->string('bureau_repr_id')->nullable();
            $table->foreign('bureau_repr_id')->references('id')->on('bureaux_representation')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('representation_exit_points');
        Schema::dropIfExists('representation_entry_points');
    }
};
