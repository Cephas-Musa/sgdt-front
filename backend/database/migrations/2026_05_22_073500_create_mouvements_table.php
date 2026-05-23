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
        Schema::create('mouvements', function (Blueprint $table) {
            $table->id();
            $table->string('operation_type', 50);
            $table->string('plaque', 50);
            $table->string('chauffeur', 255)->nullable();
            $table->string('importateur', 255)->nullable();
            $table->timestamp('date_mouvement')->useCurrent();
            $table->string('sub_type_operation', 100)->nullable();
            $table->string('empty_manifest', 100)->nullable();
            $table->timestamp('date_empty_manifest')->nullable();
            $table->json('custom_fields')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mouvements');
    }
};
