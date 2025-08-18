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
    url.searchParams.append(key, String(value));
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
