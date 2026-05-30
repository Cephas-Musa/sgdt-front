<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barrier_revenues', function (Blueprint $table) {
            $table->id();
            $table->string('barriere_code', 50);
            $table->foreignId('typing_operator_id')->constrained('users')->onDelete('cascade');
            $table->enum('document_type', ['direct', 'transhipment', 'it', 'manifest']);
            $table->string('document_id', 50);
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->date('date_revenue');
            $table->timestamps();

            $table->index('barriere_code');
            $table->index('typing_operator_id');
            $table->index('document_type');
            $table->index('date_revenue');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barrier_revenues');
    }
};
