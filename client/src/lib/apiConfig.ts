// API configuration and endpoints for FitSpark.Api integration

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    getUser: (id: number) => `/api/auth/user/${id}`,
    updateUser: (id: number) => `/api/auth/user/${id}`,
  },

  // Workouts
  workouts: {
    getUserPlans: (userId: number) => `/api/workouts/plans/user/${userId}`,
    getPlan: (planId: number, userId: number) =>
      `/api/workouts/plans/${planId}/user/${userId}`,
    createPlan: (userId: number) => `/api/workouts/plans/user/${userId}`,
    getDailyWorkout: (workoutId: number, userId: number) =>
      `/api/workouts/daily/${workoutId}/user/${userId}`,
    getDailyWorkoutsForPlan: (planId: number, userId: number) =>
      `/api/workouts/daily/plan/${planId}/user/${userId}`,
    createDailyWorkout: (userId: number) =>
      `/api/workouts/daily/user/${userId}`,
    getExercisesForWorkout: (dailyWorkoutId: number, userId: number) =>
      `/api/workouts/exercises/workout/${dailyWorkoutId}/user/${userId}`,
    createExercise: (userId: number) =>
      `/api/workouts/exercises/user/${userId}`,
    getAllExercises: "/api/workouts/exercises",
    getExercise: (exerciseId: number) =>
      `/api/workouts/exercises/${exerciseId}`,
    updateExercise: (exerciseId: number, userId: number) =>
      `/api/workouts/exercises/${exerciseId}/user/${userId}`,
    deleteExercise: (exerciseId: number, userId: number) =>
      `/api/workouts/exercises/${exerciseId}/user/${userId}`,
    createBulkExercises: "/api/workouts/exercises/bulk",
    getExerciseCategories: "/api/workouts/exercises/categories",
  },

  // Exercise Catalog
  exerciseCatalog: {
    getCatalogExercises: "/api/exercisecatalog",
    getCatalogExercise: (exerciseId: number) =>
      `/api/exercisecatalog/${exerciseId}`,
    updateCatalogExercise: (exerciseId: number) =>
      `/api/exercisecatalog/${exerciseId}`,
    createCatalogExercise: "/api/exercisecatalog",
    deleteCatalogExercise: (exerciseId: number) =>
      `/api/exercisecatalog/${exerciseId}`,
    getCategories: "/api/exercisecatalog/categories",
    reloadChairExercises: "/api/exercisecatalog/reload",
    getCatalogStatus: "/api/exercisecatalog/status",
  },

  // Progress
  progress: {
    getUserProgress: (userId: number) => `/api/progress/user/${userId}`,
    getDailyProgress: (progressId: number, userId: number) =>
      `/api/progress/${progressId}/user/${userId}`,
    createDailyProgress: (userId: number) => `/api/progress/user/${userId}`,
    updateDailyProgress: (progressId: number, userId: number) =>
      `/api/progress/${progressId}/user/${userId}`,
    getStats: (userId: number) => `/api/progress/stats/user/${userId}`,
  },

  // Videos
  videos: {
    getVideos: "/api/videos",
    getVideo: (id: number) => `/api/videos/${id}`,
    createVideo: "/api/videos",
    getCategories: "/api/videos/categories",
    getFeaturedVideos: "/api/videos/featured",
    rateVideo: (videoId: number, userId: number) =>
      `/api/videos/${videoId}/rating/user/${userId}`,
    getVideoRatings: (videoId: number) => `/api/videos/${videoId}/ratings`,
  },

  // Achievements
  achievements: {
    getAchievements: "/api/achievements",
    getUserAchievements: (userId: number) => `/api/achievements/user/${userId}`,
    getUserAchievementStats: (userId: number) =>
      `/api/achievements/user/${userId}/stats`,
    getCategories: "/api/achievements/categories",
    getLeaderboard: "/api/achievements/leaderboard",
  },
} as const;

// Helper function to build URL with query parameters
export function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): string {
  if (!params) return endpoint;

  const url = new URL(endpoint, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    // Only add the parameter if the value is not undefined, null, or empty string
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  return url.pathname + url.search;
}

// Common query parameter builders
export const buildVideoQuery = (params: {
  category?: string;
  difficultyLevel?: string;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
}) => buildUrl(API_ENDPOINTS.videos.getVideos, params);

export const buildProgressQuery = (
  userId: number,
  params: {
    startDate?: string;
    endDate?: string;
  }
) => buildUrl(API_ENDPOINTS.progress.getUserProgress(userId), params);

export const buildLeaderboardQuery = (params: { limit?: number }) =>
  buildUrl(API_ENDPOINTS.achievements.getLeaderboard, params);

export const buildExerciseCatalogQuery = (params: {
  category?: string;
  difficultyLevel?: string;
  page?: number;
  pageSize?: number;
}) => buildUrl(API_ENDPOINTS.exerciseCatalog.getCatalogExercises, params);

export const buildAllExercisesQuery = (params: {
  category?: string;
  difficultyLevel?: string;
  page?: number;
  pageSize?: number;
}) => buildUrl(API_ENDPOINTS.workouts.getAllExercises, params);
