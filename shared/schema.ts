import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  age: integer("age"),
  startWeight: integer("start_weight"),
  currentWeight: integer("current_weight"),
  targetWeight: integer("target_weight"),
  selectedTheme: text("selected_theme").notNull().default("fun"), // fun, aggressive, drill
  currentDay: integer("current_day").notNull().default(1),
  startDate: timestamp("start_date").defaultNow(),
  isAdmin: boolean("is_admin").default(false),
  fitnessGoals: jsonb("fitness_goals").$type<{
    primaryGoal: string;
    timeCommitment: number;
    fitnessLevel: string;
    healthConcerns: string[];
    motivationStyle: 'fun' | 'aggressive' | 'drill';
    preferredActivities: string[];
  }>(),
  preferences: jsonb("preferences").$type<{
    notifications: boolean;
    reminderTime: string;
    weeklyGoalMinutes: number;
  }>(),
});

export const workoutPlans = pgTable("workout_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  day: integer("day").notNull(),
  theme: text("theme").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  totalMinutes: integer("total_minutes").notNull(),
  exercises: jsonb("exercises").$type<Array<{
    name: string;
    duration: number;
    videoId?: string;
    instructions: string;
  }>>().notNull(),
  motivationMessage: text("motivation_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  youtubeId: text("youtube_id").notNull(),
  duration: integer("duration").notNull(), // in minutes
  exerciseType: text("exercise_type").notNull(), // chair-yoga, weights, walking, elliptical
  skillLevel: text("skill_level").notNull(), // beginner, intermediate, advanced
  effortLevel: integer("effort_level").notNull(), // 1-5
  equipment: text("equipment"), // none, light-weights, resistance-band
  themeCompatibility: jsonb("theme_compatibility").$type<string[]>().notNull(), // ["fun", "aggressive", "drill"]
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyProgress = pgTable("daily_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  day: integer("day").notNull(),
  minutesCompleted: integer("minutes_completed").default(0),
  weight: integer("weight"),
  completed: boolean("completed").default(false),
  exercises: jsonb("exercises").$type<Array<{
    name: string;
    completed: boolean;
    duration: number;
  }>>(),
  notes: text("notes"),
  mood: integer("mood"), // 1-5 scale
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeType: text("badge_type").notNull(), // first-week, consistency, weight-loss, etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  theme: text("theme").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workoutPlans: many(workoutPlans),
  dailyProgress: many(dailyProgress),
  achievements: many(achievements),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one }) => ({
  user: one(users, {
    fields: [workoutPlans.userId],
    references: [users.id],
  }),
}));

export const dailyProgressRelations = relations(dailyProgress, ({ one }) => ({
  user: one(users, {
    fields: [dailyProgress.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  startDate: true,
  currentDay: true,
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({
  id: true,
  createdAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  isApproved: true,
});

export const insertDailyProgressSchema = createInsertSchema(dailyProgress).omit({
  id: true,
  date: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  earnedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type DailyProgress = typeof dailyProgress.$inferSelect;
export type InsertDailyProgress = z.infer<typeof insertDailyProgressSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

// Theme types
export type Theme = "fun" | "aggressive" | "drill";
export type ExerciseType = "chair-yoga" | "weights" | "walking" | "elliptical";
export type SkillLevel = "beginner" | "intermediate" | "advanced";
