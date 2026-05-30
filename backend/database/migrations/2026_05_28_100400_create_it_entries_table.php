<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('it_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('dossier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('typing_operator_id')->constrained('users')->onDelete('cascade');
            $table->string('consignee', 255)->nullable();
            $table->string('chassis', 100)->nullable();
            $table->string('vehicule_mark', 100)->nullable();
            $table->string('manifest_year', 10)->nullable();
            $table->string('color', 50)->nullable();
            $table->string('it_reference', 100)->nullable();
            $table->enum('status', ['pending', 'linked', 'validated', 'rejected'])->default('pending');
            $table->timestamps();

            $table->index('dossier_id');
            $table->index('typing_operator_id');
            $table->index('it_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('it_entries');
    }
};
