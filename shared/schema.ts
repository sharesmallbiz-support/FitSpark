import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --------------------------------------------
// Core domain enums / union types
// --------------------------------------------
export const themeEnum = z.enum(["fun", "aggressive", "drill"]);
export type Theme = z.infer<typeof themeEnum>;

// You can expand exercise types as needed
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
// Users table (expanded to match app usage)
// --------------------------------------------
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  age: integer("age"),
  startWeight: integer("start_weight"),
  currentWeight: integer("current_weight"),
  targetWeight: integer("target_weight"),
  currentDay: integer("current_day").default(1),
  selectedTheme: text("selected_theme"),
  fitnessGoals: text("fitness_goals"), // JSON string
  isAdmin: integer("is_admin").default(0), // 0/1 flag
  createdAt: integer("created_at", { mode: "timestamp" }),
});

// --------------------------------------------
// Workout Plans (personalized program days)
// --------------------------------------------
export const workoutPlans = sqliteTable("workout_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  day: integer("day").notNull(),
  theme: text("theme").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  totalMinutes: integer("total_minutes").notNull(),
  exercises: text("exercises"), // JSON array string
  motivationMessage: text("motivation_message"),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

// --------------------------------------------
// Videos catalog
// --------------------------------------------
export const videos = sqliteTable("videos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  youtubeId: text("youtube_id").notNull(),
  duration: integer("duration").notNull(), // minutes
  exerciseType: text("exercise_type"), // free-form or enum mapping
  skillLevel: text("skill_level"),
  effortLevel: integer("effort_level"), // 1-5
  equipment: text("equipment"),
  themeCompatibility: text("theme_compatibility"), // JSON array string
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  isApproved: integer("is_approved").default(0), // 0/1
  createdAt: integer("created_at", { mode: "timestamp" }),
});

// --------------------------------------------
// Daily Progress (user logs)
// --------------------------------------------
export const dailyProgress = sqliteTable("daily_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  date: integer("date", { mode: "timestamp" }).notNull(),
  day: integer("day").notNull(),
  minutesCompleted: integer("minutes_completed").default(0),
  weight: integer("weight"),
  completed: integer("completed").default(0), // 0/1
  exercises: text("exercises"), // JSON array string
  notes: text("notes"),
  mood: integer("mood"), // 1-5 maybe
  createdAt: integer("created_at", { mode: "timestamp" }),
});

// --------------------------------------------
// Achievements
// --------------------------------------------
export const achievements = sqliteTable("achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  badgeType: text("badge_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  earnedAt: integer("earned_at", { mode: "timestamp" }),
  theme: text("theme").notNull(),
});

// --------------------------------------------
// (Legacy / simple) Workouts table (optional ad-hoc workouts user logs)
// --------------------------------------------
export const workouts = sqliteTable("workouts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  date: integer("date", { mode: "timestamp" }).notNull(),
  type: text("type").notNull(),
  duration: integer("duration").notNull(), // in minutes
  calories: real("calories"),
});

// --------------------------------------------
// Insert Schemas (Zod)
// --------------------------------------------
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({
  id: true,
});
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true });
export const insertDailyProgressSchema = createInsertSchema(dailyProgress).omit(
  { id: true }
);
export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

// --------------------------------------------
// Types (Select & Insert)
// --------------------------------------------
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = typeof workoutPlans.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;
export type DailyProgress = typeof dailyProgress.$inferSelect;
export type InsertDailyProgress = typeof dailyProgress.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
