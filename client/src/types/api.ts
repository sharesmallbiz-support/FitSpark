// API Types matching FitSpark.Api DTOs

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  weightPounds?: number;
  targetWeightPounds?: number;
  heightFeet?: string;
  heightInches?: string;
  gender?: string;
  fitnessGoal?: string;
  motivationTheme: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  // Legacy compatibility properties
  currentDay?: number;
  isAdmin?: number; // 1 for admin, 0 for user
  // Additional legacy properties used in Progress page
  startWeight?: number;
  currentWeight?: number;
  targetWeight?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  weightPounds?: number;
  targetWeightPounds?: number;
  heightFeet?: string;
  heightInches?: string;
  gender?: string;
  fitnessGoal?: string;
  motivationTheme: string;
}

export interface WorkoutPlan {
  id: number;
  userId: number;
  name: string;
  description?: string;
  durationDays: number;
  difficultyLevel: string;
  motivationTheme: string;
  isActive: boolean;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  dailyWorkouts: DailyWorkout[];
}

export interface CreateWorkoutPlanDto {
  name: string;
  description?: string;
  durationDays: number;
  difficultyLevel: string;
  motivationTheme: string;
  startDate?: Date;
}

export interface UpdateWorkoutPlanDto {
  name?: string;
  description?: string;
  durationDays?: number;
  difficultyLevel?: string;
  motivationTheme?: string;
  startDate?: Date;
}

export interface UpdateWorkoutPlanStatusDto {
  isActive: boolean;
}

export interface DailyWorkout {
  id: number;
  workoutPlanId: number;
  dayNumber: number;
  title: string;
  description?: string;
  estimatedDurationMinutes: number;
  difficultyLevel: string;
  motivationalMessage?: string;
  isRestDay: boolean;
  createdAt: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: number;
  dailyWorkoutId: number;
  name: string;
  description?: string;
  category: string;
  sets?: number;
  reps?: number;
  durationMinutes?: number;
  weightPounds?: number;
  distanceMiles?: number;
  videoUrl?: string;
  videoTitle?: string;
  instructions?: string;
  difficultyLevel: string;
  displayOrder: number;
  isRequired: boolean;
  createdAt: string;
}

export interface DailyProgress {
  id: number;
  userId: number;
  dailyWorkoutId: number;
  date: string;
  isCompleted: boolean;
  moodRating?: number;
  energyLevel?: number;
  effortLevel?: number;
  actualDurationMinutes?: number;
  notes?: string;
  weightPounds?: number;
  skippedReason?: string;
  createdAt: string;
  completedAt?: string;
  exerciseProgress: ExerciseProgress[];
  // Legacy compatibility properties
  completed?: boolean; // Maps to isCompleted
  minutesCompleted?: number; // Maps to actualDurationMinutes
  weight?: number; // Maps to weightPounds
}

export interface ExerciseProgress {
  id: number;
  dailyProgressId: number;
  exerciseId: number;
  isCompleted: boolean;
  actualSets?: number;
  actualReps?: number;
  actualDurationMinutes?: number;
  actualWeightPounds?: number;
  actualDistanceMiles?: number;
  notes?: string;
  difficultyRating?: number;
  createdAt: string;
}

export interface Video {
  id: number;
  title: string;
  description?: string;
  youtubeUrl?: string;
  youtubeId: string; // For admin form compatibility
  youtubeVideoId?: string;
  category?: string;
  difficultyLevel?: string;
  skillLevel?: string; // For admin form compatibility
  durationMinutes?: number;
  duration?: number; // For admin form compatibility
  instructor?: string;
  tags?: string;
  exerciseType?: string; // For admin form compatibility
  effortLevel?: number; // For admin form compatibility
  equipment?: string; // For admin form compatibility
  themeCompatibility?: string | string[]; // For admin form compatibility
  thumbnailUrl?: string; // For admin form compatibility
  isActive?: boolean;
  isFeatured?: boolean;
  isApproved?: number; // For admin form compatibility (1/0)
  viewCount?: number;
  averageRating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  iconUrl?: string;
  category: string;
  rarity: string;
  pointValue: number;
  criteriaDescription: string;
  isActive: boolean;
  createdAt: string;
  // Legacy compatibility properties
  title?: string; // Maps to name
  icon?: string; // Maps to iconUrl
  theme?: string; // Maps to category
  earnedAt?: string; // For progress display
}

export interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  earnedAt: string;
  notes?: string;
  isNotified: boolean;
  achievement: Achievement;
}
