<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    /**
     * Redirect to Google OAuth
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth Callback
     */
    public function handleGoogleCallback()
    {
        try {
            $user = Socialite::driver('google')->user();
            $this->loginOrCreateUser($user, 'google');
            return redirect('/dashboard');
        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['message' => 'Failed to authenticate with Google']);
        }
    }

    /**
     * Redirect to GitHub OAuth
     */
    public function redirectToGithub()
    {
        return Socialite::driver('github')->redirect();
    }

    /**
     * Handle GitHub OAuth Callback
     */
    public function handleGithubCallback()
    {
        try {
            $user = Socialite::driver('github')->user();
            $this->loginOrCreateUser($user, 'github');
            return redirect('/dashboard');
        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['message' => 'Failed to authenticate with GitHub']);
        }
    }

    /**
     * Login or create user from OAuth provider
     */
    private function loginOrCreateUser($oauthUser, $provider)
    {
        $user = null;

        // Try to find user by OAuth ID
        if ($provider === 'google') {
            $user = User::where('google_id', $oauthUser->id)->first();
        } elseif ($provider === 'github') {
            $user = User::where('github_id', $oauthUser->id)->first();
        }

        // If user doesn't exist, try to find by email
        if (!$user) {
            $user = User::where('email', $oauthUser->email)->first();
        }

        // If user still doesn't exist, create a new one
        if (!$user) {
            $user = User::create([
                'name' => $oauthUser->name ?? $oauthUser->nickname ?? 'User',
                'email' => $oauthUser->email,
                'password' => bcrypt(Str::random(24)), // Random password since they're using OAuth
                'role' => 'student', // Default role for new users
                'oauth_provider' => $provider,
                'oauth_avatar' => $oauthUser->avatar,
            ]);
        } else {
            // Update existing user with OAuth details if not already set
            if ($provider === 'google' && !$user->google_id) {
                $user->update(['google_id' => $oauthUser->id]);
            } elseif ($provider === 'github' && !$user->github_id) {
                $user->update(['github_id' => $oauthUser->id]);
            }

            // Update avatar if not set
            if (!$user->oauth_avatar && $oauthUser->avatar) {
                $user->update(['oauth_avatar' => $oauthUser->avatar]);
            }
        }

        // Update the provider ID
        if ($provider === 'google') {
            $user->google_id = $oauthUser->id;
        } elseif ($provider === 'github') {
            $user->github_id = $oauthUser->id;
        }

        if (!$user->oauth_provider) {
            $user->oauth_provider = $provider;
        }

        $user->save();

        // Login the user
        Auth::login($user, true);
    }
}
