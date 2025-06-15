<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SocialMediaProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Get admin dashboard overview.
     */
    public function overview(): JsonResponse
    {
        $stats = [
            'users' => [
                'total' => User::count(),
                'admins' => User::where('is_admin', true)->count(),
                'regular' => User::where('is_admin', false)->count(),
                'recent' => User::where('created_at', '>=', now()->subDays(30))->count(),
            ],
            'profiles' => [
                'total' => SocialMediaProfile::count(),
                'active' => SocialMediaProfile::where('is_active', true)->count(),
                'inactive' => SocialMediaProfile::where('is_active', false)->count(),
                'recent' => SocialMediaProfile::where('created_at', '>=', now()->subDays(30))->count(),
            ],
            'platforms' => SocialMediaProfile::selectRaw('platform, COUNT(*) as count')
                ->groupBy('platform')
                ->pluck('count', 'platform'),
        ];

        // Recent activity
        $recentUsers = User::latest()->take(5)->get(['id', 'name', 'email', 'created_at']);
        $recentProfiles = SocialMediaProfile::with('user:id,name,email')
            ->latest()
            ->take(5)
            ->get(['id', 'user_id', 'platform', 'username', 'created_at']);

        // Growth data for charts (last 30 days)
        $growthData = [
            'users' => $this->getGrowthData('users'),
            'profiles' => $this->getGrowthData('social_media_profiles'),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_users' => $recentUsers,
                'recent_profiles' => $recentProfiles,
                'growth_data' => $growthData,
            ]
        ]);
    }

    /**
     * Get growth data for the last 30 days.
     */
    private function getGrowthData(string $table): array
    {
        $data = DB::table($table)
            ->select(DB::raw('DATE(created_at) as date, COUNT(*) as count'))
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        // Fill missing dates with 0
        $result = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $count = $data->firstWhere('date', $date)?->count ?? 0;
            $result[] = [
                'date' => $date,
                'count' => $count,
            ];
        }

        return $result;
    }

    /**
     * Get system information.
     */
    public function systemInfo(): JsonResponse
    {
        $info = [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'database' => [
                'driver' => config('database.default'),
                'version' => DB::select('SELECT sqlite_version() as version')[0]->version ?? 'Unknown',
            ],
            'server_time' => now()->toISOString(),
            'timezone' => config('app.timezone'),
            'environment' => app()->environment(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'system_info' => $info
            ]
        ]);
    }
}