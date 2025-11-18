<?php

namespace App\Http\Middleware;

use App\Services\AffiliateService;
use Closure;
use Illuminate\Http\Request;

class CaptureAffiliate
{
    protected AffiliateService $affiliateService;

    public function __construct(AffiliateService $affiliateService)
    {
        $this->affiliateService = $affiliateService;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Check for affiliate parameter in query string
        $affKey = $request->query('aff') ?? $request->query('ref');

        if ($affKey) {
            $this->affiliateService->captureClick($affKey, $request);
        }

        return $next($request);
    }
}
