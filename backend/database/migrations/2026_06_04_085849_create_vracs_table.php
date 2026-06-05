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
        Schema::create('vracs', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->uuid('dossier_id')->nullable()->index();
            $table->string('type')->nullable();
            $table->string('importateur')->nullable();
            $table->string('plaque')->nullable();
            $table->integer('quantite')->default(0);
            $table->decimal('poids', 12, 2)->default(0);
            $table->string('status')->default('en_attente');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vracs');
    }
};
