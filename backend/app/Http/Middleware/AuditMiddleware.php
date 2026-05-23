<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\AuditService;
use Symfony\Component\HttpFoundation\Response;

class AuditMiddleware
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // First let the request be processed so the user is authenticated (if applicable)
        $response = $next($request);

        $method = $request->method();

        if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $action = $method . ' ' . $request->path();
            $module = $this->determineModule($request->path());
            
            // Only log the payload, scrub passwords
            $payload = $request->except(['password', 'password_confirmation', 'pin']);
            
            // For updates/deletes, finding the old_value requires model hooks. 
            // In middleware, we primarily log the request payload as the new_value (or just context).
            if (auth()->check()) {
                $this->auditService->log($action, $module, null, $payload);
            }
        }

        return $response;
    }

    /**
     * Determine the module from the request path.
     *
     * @param string $path
     * @return string
     */
    private function determineModule(string $path): string
    {
        $segments = explode('/', trim($path, '/'));
        
        // Skip 'api' if it's the first segment
        if (isset($segments[0]) && $segments[0] === 'api') {
            return $segments[1] ?? 'unknown';
        }

        return $segments[0] ?? 'unknown';
    }
}
