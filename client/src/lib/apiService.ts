// API service layer for FitSpark.Api integration
import { apiRequest } from "./queryClient";
import {
  API_ENDPOINTS,
  buildVideoQuery,
  buildProgressQuery,
  buildLeaderboardQuery,
} from "./apiConfig";
import type {
  ApiUser,
  LoginRequest,
  RegisterRequest,
  WorkoutPlan,
  DailyWorkout,
  DailyProgress,
  Video,
  Achievement,
  UserAchievement,
} from "@/types/api";

// Authentication Services
export const authService = {
  async login(credentials: LoginRequest): Promise<ApiUser> {
    const response = await apiRequest(
      "POST",
      API_ENDPOINTS.auth.login,
      credentials
    );
    return response.json();
  },

  async register(userData: RegisterRequest): Promise<ApiUser> {
    const response = await apiRequest(
      "POST",
      API_ENDPOINTS.auth.register,
      userData
    );
    return response.json();
  },

  async getUser(id: number): Promise<ApiUser> {
    const response = await apiRequest("GET", API_ENDPOINTS.auth.getUser(id));
    return response.json();
  },

  async updateUser(
    id: number,
    updates: {
      firstName?: string;
      lastName?: string;
      age?: number;
      weightPounds?: number;
      targetWeightPounds?: number;
      heightFeet?: string;
      heightInches?: string;
      gender?: string;
      fitnessGoal?: string;
      motivationTheme?: string;
    }
  ): Promise<ApiUser> {
    const response = await apiRequest(
      "PUT",
      API_ENDPOINTS.auth.updateUser(id),
      updates
    );
    return response.json();
  },
};

// Workout Services
export const workoutService = {
  async getUserWorkoutPlans(userId: number): Promise<WorkoutPlan[]> {
    const response = await apiRequest(
      "GET",
      API_ENDPOINTS.workouts.getUserPlans(userId)
    );
    return response.json();
  },

  async getWorkoutPlan(planId: number, userId: number): Promise<WorkoutPlan> {
    const response = await apiRequest(
      "GET",
      API_ENDPOINTS.workouts.getPlan(planId, userId)
    );
    return response.json();
  },

  async createWorkoutPlan(userId: number, planData: any): Promise<WorkoutPlan> {
    const response = await apiRequest(
      "POST",
      API_ENDPOINTS.workouts.createPlan(userId),
      planData
    );
    return response.json();
  },

  async getDailyWorkout(
    workoutId: number,
    userId: number
  ): Promise<DailyWorkout> {
    const response = await apiRequest(
      "GET",
      API_ENDPOINTS.workouts.getDailyWorkout(workoutId, userId)
    );
    return response.json();
  },

  async getDailyWorkoutsForPlan(
    planId: number,
    userId: number
  ): Promise<DailyWorkout[]> {
    const response = await apiRequest(
      "GET",
      API_ENDPOINTS.workouts.getDailyWorkoutsForPlan(planId, userId)
    );
    return response.json();
  },
};

// Progress Services
export const progressService = {
  async getUserProgress(
    userId: number,
    startDate?: string,
    endDate?: string
  ): Promise<DailyProgress[]> {
    const url = buildProgressQuery(userId, { startDate, endDate });
    const response = await apiRequest("GET", url);
    return response.json();
  },

  async createDailyProgress(
    userId: number,
    progressData: any
  ): Promise<DailyProgress> {
    const response = await apiRequest(
      "POST",
      API_ENDPOINTS.progress.createDailyProgress(userId),
      progressData
    );
    return response.json();
  },

  async updateDailyProgress(
    progressId: number,
    userId: number,
    updates: any
  ): Promise<DailyProgress> {
    const response = await apiRequest(
      "PUT",
      API_ENDPOINTS.progress.updateDailyProgress(progressId, userId),
      updates
    );
    return response.json();
  },

  async getProgressStats(userId: number, days: number = 30): Promise<any> {
    const response = await apiRequest(
      "GET",
      `${API_ENDPOINTS.progress.getStats(userId)}?days=${days}`
    );
    return response.json();
  },
};

// Video Services
export const videoService = {
  async getVideos(params?: {
    category?: string;
    difficultyLevel?: string;
    isFeatured?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<Video[]> {
    const url = buildVideoQuery(params || {});
    const response = await apiRequest("GET", url);
    return response.json();
  },

  async getVideo(id: number): Promise<Video> {
    const response = await apiRequest("GET", API_ENDPOINTS.videos.getVideo(id));
    return response.json();
  },

  async getFeaturedVideos(count: number = 6): Promise<Video[]> {
    const response = await apiRequest(
      "GET",
      `${API_ENDPOINTS.videos.getFeaturedVideos}?count=${count}`
    );
    return response.json();
  },

  async getCategories(): Promise<string[]> {
    const response = await apiRequest(
      "GET",
      API_ENDPOINTS.videos.getCategories
    );
    return response.json();
  },

  async rateVideo(
    videoId: number,
    userId: number,
    rating: number,
    review?: string
  ): Promise<any> {
    const response = await apiRequest(
      "POST",
      API_ENDPOINTS.videos.rateVideo(videoId, userId),
      {
        rating,
        review,
      }
    );
    return response.json();
  },
};

// Achievement Services
export const achievementService = {
  async getAchievements(category?: string): Promise<Achievement[]> {
    const url = category
      ? `${API_ENDPOINTS.achievements.getAchievements}?category=${category}`
      : API_ENDPOINTS.achievements.getAchievements;
    const response = await apiRequest("GET", url);
    return response.json();
  },

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    const response = await apiRequest(
      "GET",
      API_ENDPOINTS.achievements.getUserAchievements(userId)
    );
    return response.json();
  },

  async getUserAchievementStats(userId: number): Promise<any> {
    const response = await apiRequest(
      "GET",
      API_ENDPOINTS.achievements.getUserAchievementStats(userId)
    );
    return response.json();
  },

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    const url = buildLeaderboardQuery({ limit });
    const response = await apiRequest("GET", url);
    return response.json();
  },

  async getCategories(): Promise<string[]> {
    const response = await apiRequest(
      "GET",
      API_ENDPOINTS.achievements.getCategories
    );
    return response.json();
  },
};
