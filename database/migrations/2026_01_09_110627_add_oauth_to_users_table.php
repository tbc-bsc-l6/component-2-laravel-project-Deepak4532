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
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->unique()->after('role');
            $table->string('github_id')->nullable()->unique()->after('google_id');
            $table->string('oauth_provider')->nullable()->after('github_id');
            $table->text('oauth_avatar')->nullable()->after('oauth_provider');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'github_id', 'oauth_provider', 'oauth_avatar']);
        });
    }
};
