<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('typing_docs_direct', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('dossier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('typing_operator_id')->constrained('users')->onDelete('cascade');
            $table->string('barriere_code', 50)->nullable(); // ex: UGMPO
            $table->string('office', 100)->nullable();
            $table->string('entree_reference', 100)->nullable();
            $table->date('date_entree')->nullable();
            $table->string('t1_reference', 100)->nullable();
            $table->date('t1_date')->nullable();
            $table->string('consignee', 255)->nullable();
            $table->string('country_of_export', 100)->nullable();
            $table->string('vehicule_reference', 100)->nullable();
            $table->string('container_number', 100)->nullable();
            $table->integer('container_20')->default(0);
            $table->integer('container_40')->default(0);
            $table->enum('status', ['pending', 'linked', 'validated', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('dossier_id');
            $table->index('typing_operator_id');
            $table->index('t1_reference');
            $table->index('barriere_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('typing_docs_direct');
    }
};
