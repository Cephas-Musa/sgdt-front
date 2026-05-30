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
        Schema::create('dossier_anomalies', function (Blueprint $table) {
            $table->id();
            $table->uuid('dossier_id')->index();
            $table->string('type');
            $table->string('severity')->default('medium');
            $table->text('description')->nullable();
            $table->foreignId('detected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('resolved')->default(false);
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->foreign('dossier_id')->references('id')->on('dossiers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dossier_anomalies');
    }
};
