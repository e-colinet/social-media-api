<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SocialMediaProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class AdminSocialMediaProfileController extends Controller
{
    /**
     * Display a listing of all social media profiles.
     */
    public function index(Request $request): JsonResponse
    {
        $query = SocialMediaProfile::with('user');

        // Search functionality
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('username', 'like', '%' . $request->search . '%')
                  ->orWhere('display_name', 'like', '%' . $request->search . '%')
                  ->orWhere('platform', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function ($userQuery) use ($request) {
                      $userQuery->where('name', 'like', '%' . $request->search . '%')
                               ->orWhere('email', 'like', '%' . $request->search . '%');
                  });
            });
        }

        // Filter by platform
        if ($request->platform) {
            $query->where('platform', $request->platform);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by user
        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $profiles = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'profiles' => $profiles->items(),
                'pagination' => [
                    'current_page' => $profiles->currentPage(),
                    'last_page' => $profiles->lastPage(),
                    'per_page' => $profiles->perPage(),
                    'total' => $profiles->total(),
                ]
            ]
        ]);
    }

    /**
     * Display the specified social media profile.
     */
    public function show(SocialMediaProfile $socialMediaProfile): JsonResponse
    {
        $socialMediaProfile->load('user');

        return response()->json([
            'success' => true,
            'data' => [
                'profile' => $socialMediaProfile
            ]
        ]);
    }

    /**
     * Update the specified social media profile.
     */
    public function update(Request $request, SocialMediaProfile $socialMediaProfile): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'platform_user_id' => 'sometimes|required|string',
            'username' => 'nullable|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'profile_url' => 'nullable|url|max:500',
            'avatar_url' => 'nullable|url|max:500',
            'bio' => 'nullable|string|max:1000',
            'additional_data' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $socialMediaProfile->update(array_merge(
            $request->only([
                'platform_user_id',
                'username',
                'display_name',
                'profile_url',
                'avatar_url',
                'bio',
                'additional_data',
                'is_active'
            ]),
            ['last_synced_at' => now()]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Social media profile updated successfully',
            'data' => [
                'profile' => $socialMediaProfile->fresh()->load('user')
            ]
        ]);
    }

    /**
     * Remove the specified social media profile.
     */
    public function destroy(SocialMediaProfile $socialMediaProfile): JsonResponse
    {
        $socialMediaProfile->delete();

        return response()->json([
            'success' => true,
            'message' => 'Social media profile deleted successfully'
        ]);
    }

    /**
     * Get social media profile statistics.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_profiles' => SocialMediaProfile::count(),
            'active_profiles' => SocialMediaProfile::where('is_active', true)->count(),
            'inactive_profiles' => SocialMediaProfile::where('is_active', false)->count(),
            'profiles_by_platform' => SocialMediaProfile::selectRaw('platform, COUNT(*) as count')
                ->groupBy('platform')
                ->pluck('count', 'platform'),
            'recent_profiles' => SocialMediaProfile::where('created_at', '>=', now()->subDays(30))->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats
            ]
        ]);
    }

    /**
     * Create a new social media profile for a user (admin only).
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'platform' => 'required|string|in:facebook,twitter,instagram,linkedin,youtube,tiktok,snapchat,pinterest',
            'platform_user_id' => 'required|string',
            'username' => 'nullable|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'profile_url' => 'nullable|url|max:500',
            'avatar_url' => 'nullable|url|max:500',
            'bio' => 'nullable|string|max:1000',
            'additional_data' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if profile already exists for this user and platform
        $existingProfile = SocialMediaProfile::where('user_id', $request->user_id)
            ->where('platform', $request->platform)
            ->first();

        if ($existingProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Profile for this platform already exists for this user.'
            ], 409);
        }

        $profile = SocialMediaProfile::create([
            'user_id' => $request->user_id,
            'platform' => $request->platform,
            'platform_user_id' => $request->platform_user_id,
            'username' => $request->username,
            'display_name' => $request->display_name,
            'profile_url' => $request->profile_url,
            'avatar_url' => $request->avatar_url,
            'bio' => $request->bio,
            'additional_data' => $request->additional_data,
            'is_active' => $request->boolean('is_active', true),
            'last_synced_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Social media profile created successfully',
            'data' => [
                'profile' => $profile->load('user')
            ]
        ], 201);
    }

    /**
     * Bulk delete profiles.
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'profile_ids' => 'required|array',
            'profile_ids.*' => 'exists:social_media_profiles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $deletedCount = SocialMediaProfile::whereIn('id', $request->profile_ids)->delete();

        return response()->json([
            'success' => true,
            'message' => "Successfully deleted {$deletedCount} social media profiles"
        ]);
    }
}