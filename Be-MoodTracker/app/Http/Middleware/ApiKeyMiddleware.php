<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->query('apiKey');

        if (!$apiKey || $apiKey !== config('app.app_api_key')) {
            return response()->json([
            'error' => 'Unauthorized',
            'message' => 'Anda tidak memiliki apiKey',
            'status' => 401,
            ], 401);
        }

        return $next($request);
    }
}
