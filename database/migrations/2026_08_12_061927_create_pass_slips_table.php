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
        Schema::create('pass_slips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('position');
            $table->string('usd');
            $table->string('destination');
            $table->text('purpose');
            $table->string('request_type');
            $table->datetime('departure');
            $table->datetime('arrival');
            $table->boolean('status')->default(false);
            $table->foreignId('assigned_to')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */



    public function down(): void
    {
        Schema::dropIfExists('pass_slips');
    }
};
