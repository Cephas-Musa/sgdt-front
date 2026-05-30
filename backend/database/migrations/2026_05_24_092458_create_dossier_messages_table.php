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
        Schema::create('dossier_messages', function (Blueprint $table) {
            $table->id();
            $table->uuid('dossier_id')->index();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->text('message');
            $table->string('attachment')->nullable();
            $table->timestamp('seen_at')->nullable();
            $table->timestamps();

            $table->foreign('dossier_id')->references('id')->on('dossiers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dossier_messages');
    }
};
