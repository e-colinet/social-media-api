<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SocialMediaProfileController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminSocialMediaProfileController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Auth routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Social Media Profile routes
    Route::apiResource('social-media-profiles', SocialMediaProfileController::class);
    
    // Additional profile routes
    Route::get('/social-media-profiles-by-platform', [SocialMediaProfileController::class, 'byPlatform']);
    Route::post('/social-media-profiles/{socialMediaProfile}/sync', [SocialMediaProfileController::class, 'sync']);
});

// Admin routes
Route::middleware(['auth:api', 'admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard/overview', [AdminDashboardController::class, 'overview']);
    Route::get('/dashboard/system-info', [AdminDashboardController::class, 'systemInfo']);
    
    // User management
    Route::apiResource('users', AdminUserController::class);
    Route::get('/users-stats', [AdminUserController::class, 'stats']);
    
    // Social Media Profile management
    Route::apiResource('social-media-profiles', AdminSocialMediaProfileController::class);
    Route::get('/social-media-profiles-stats', [AdminSocialMediaProfileController::class, 'stats']);
    Route::delete('/social-media-profiles-bulk', [AdminSocialMediaProfileController::class, 'bulkDelete']);
});

// Health check route
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'API is running',
        'timestamp' => now()->toISOString()
    ]);
});

// OpenAPI documentation endpoints
Route::get('/openapi.yaml', function () {
    return response()->file(base_path('openapi.yaml'), [
        'Content-Type' => 'application/x-yaml'
    ]);
});
