<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimitRequests
{
    public function __construct(protected RateLimiter $limiter)
    {
    }

    public function handle(Request $request, Closure $next, string $limit = '60,1'): Response
    {
        [$requests, $minutes] = explode(',', $limit);

        $key = $this->resolveRequestSignature($request);

        if ($this->limiter->tooManyAttempts($key, (int) $requests)) {
            return response()->json([
                'message' => 'Trop de requêtes. Veuillez réessayer dans ' .
                           $this->limiter->availableIn($key) . ' secondes.'
            ], 429);
        }

        $this->limiter->hit($key, (int) $minutes * 60);

        return $next($request);
    }

    protected function resolveRequestSignature(Request $request): string
    {
        return hash('sha256',
            $request->user()?->id ?: $request->ip() .
            '|' . $request->path()
        );
    }
}
