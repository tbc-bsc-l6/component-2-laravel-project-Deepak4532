<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  mixed  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Allow if user has any of the specified roles
        if (in_array($request->user()?->role, $roles)) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Unauthorized. Required role(s): ' . implode(', ', $roles),
        ], 403);
    }
}
