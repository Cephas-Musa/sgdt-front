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
        Schema::create('dossier_validations', function (Blueprint $table) {
            $table->id();
            $table->uuid('dossier_id')->index();
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('validation_type');
            $table->string('status')->default('valid');
            $table->text('observation')->nullable();
            $table->string('validated_ip')->nullable();
            $table->string('validated_device')->nullable();
            $table->timestamp('validated_at')->useCurrent();
            $table->timestamps();

            $table->foreign('dossier_id')->references('id')->on('dossiers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dossier_validations');
    }
};
