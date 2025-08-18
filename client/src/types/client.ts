// Client-side types for FitSpark application
// These types mirror the server-side entities but without database dependencies

import { z } from "zod";

// --------------------------------------------
// Core domain enums / union types
// --------------------------------------------
export const themeEnum = z.enum(["fun", "aggressive", "drill"]);
export type Theme = z.infer<typeof themeEnum>;

export const exerciseTypeEnum = z.enum([
  "cardio",
  "strength",
  "flexibility",
  "balance",
  "mobility",
  "yoga",
  "walking",
]);
export type ExerciseType = z.infer<typeof exerciseTypeEnum>;

// --------------------------------------------
// User Types
// --------------------------------------------
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  password: string;
  age?: number | null;
  startWeight?: number | null;
  currentWeight?: number | null;
  targetWeight?: number | null;
  currentDay?: number;
  selectedTheme?: string | null;
  fitnessGoals?: string | null; // JSON string
  isAdmin?: number;
  createdAt?: number | null;
}

export interface InsertUser {
  username: string;
  name: string;
  email: string;
  password: string;
  age?: number | null;
  startWeight?: number | null;
  currentWeight?: number | null;
  targetWeight?: number | null;
  currentDay?: number;
  selectedTheme?: string | null;
  fitnessGoals?: string | null;
  isAdmin?: number;
  createdAt?: number | null;
}

// --------------------------------------------
// Workout Plan Types
// --------------------------------------------
export interface WorkoutPlan {
  id: number;
  userId: number;
  day: number;
  theme: string;
  title: string;
  description?: string | null;
  totalMinutes: number;
  exercises?: string | null; // JSON array string
  motivationMessage?: string | null;
  createdAt?: number | null;
}

export interface InsertWorkoutPlan {
  userId: number;
  day: number;
  theme: string;
  title: string;
  description?: string | null;
  totalMinutes: number;
  exercises?: string | null;
  motivationMessage?: string | null;
  createdAt?: number | null;
}

// --------------------------------------------
// Video Types
// --------------------------------------------
export interface Video {
  id: number;
  title: string;
  youtubeId: string;
  duration: number; // minutes
  exerciseType?: string | null;
  skillLevel?: string | null;
  effortLevel?: number | null; // 1-5
  equipment?: string | null;
  themeCompatibility?: string | null; // JSON array string
  description?: string | null;
  thumbnailUrl?: string | null;
  isApproved?: number;
  createdAt?: number | null;
}

export interface InsertVideo {
  title: string;
  youtubeId: string;
  duration: number;
  exerciseType?: string | null;
  skillLevel?: string | null;
  effortLevel?: number | null;
  equipment?: string | null;
  themeCompatibility?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  isApproved?: number;
  createdAt?: number | null;
}

// --------------------------------------------
// Daily Progress Types
// --------------------------------------------
export interface DailyProgress {
  id: number;
  userId: number;
  date: number; // timestamp
  day: number;
  minutesCompleted?: number;
  weight?: number | null;
  completed?: number;
  exercises?: string | null; // JSON array string
  notes?: string | null;
  mood?: number | null; // 1-5
  createdAt?: number | null;
}

export interface InsertDailyProgress {
  userId: number;
  date: number;
  day: number;
  minutesCompleted?: number;
  weight?: number | null;
  completed?: number;
  exercises?: string | null;
  notes?: string | null;
  mood?: number | null;
  createdAt?: number | null;
}

// --------------------------------------------
// Achievement Types
// --------------------------------------------
export interface Achievement {
  id: number;
  userId: number;
  badgeType: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: number | null;
  theme: string;
}

export interface InsertAchievement {
  userId: number;
  badgeType: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: number | null;
  theme: string;
}

// --------------------------------------------
// Workout Types (Legacy)
// --------------------------------------------
export interface Workout {
  id: number;
  userId: number;
  date: number; // timestamp
  type: string;
  duration: number; // in minutes
  calories?: number | null;
}

// --------------------------------------------
// Validation Schemas
// --------------------------------------------
export const insertUserSchema = z.object({
  username: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().min(18).max(120).optional(),
  startWeight: z.number().min(50).max(500).optional(),
  currentWeight: z.number().min(50).max(500).optional(),
  targetWeight: z.number().min(50).max(500).optional(),
  currentDay: z.number().min(1).optional(),
  selectedTheme: z.string().optional(),
  fitnessGoals: z.string().optional(),
  isAdmin: z.number().optional(),
});

export const insertVideoSchema = z.object({
  title: z.string().min(1),
  youtubeId: z.string().min(1),
  duration: z.number().min(1),
  exerciseType: z.string().optional(),
  skillLevel: z.string().optional(),
  effortLevel: z.number().min(1).max(5).optional(),
  equipment: z.string().optional(),
  themeCompatibility: z.string().optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  isApproved: z.number().optional(),
});

export const insertDailyProgressSchema = z.object({
  userId: z.number(),
  date: z.number(),
  day: z.number(),
  minutesCompleted: z.number().optional(),
  weight: z.number().optional(),
  completed: z.number().optional(),
  exercises: z.string().optional(),
  notes: z.string().optional(),
  mood: z.number().min(1).max(5).optional(),
});

export const insertAchievementSchema = z.object({
  userId: z.number(),
  badgeType: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  earnedAt: z.number().optional(),
  theme: z.string(),
});
