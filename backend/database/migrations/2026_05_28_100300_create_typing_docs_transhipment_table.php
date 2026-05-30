<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('typing_docs_transhipment', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('dossier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('typing_operator_id')->constrained('users')->onDelete('cascade');
            $table->integer('nombre_vehicules')->default(1);
            $table->string('transhipped_to', 255)->nullable();
            $table->string('vehicule_reference', 100)->nullable();
            $table->string('container_number', 100)->nullable();
            $table->string('document_reference', 100)->nullable();
            $table->date('date_doc')->nullable();
            $table->enum('status', ['pending', 'linked', 'validated', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('dossier_id');
            $table->index('typing_operator_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('typing_docs_transhipment');
    }
};
