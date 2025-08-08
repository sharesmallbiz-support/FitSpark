import { 
  type User, 
  type InsertUser, 
  type WorkoutPlan, 
  type InsertWorkoutPlan,
  type Video,
  type InsertVideo,
  type DailyProgress,
  type InsertDailyProgress,
  type Achievement,
  type InsertAchievement,
  users,
  workoutPlans,
  videos,
  dailyProgress,
  achievements
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  
  // Workout Plans
  getWorkoutPlan(userId: string, day: number): Promise<WorkoutPlan | undefined>;
  getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]>;
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  deleteUserWorkoutPlans(userId: string): Promise<void>;
  
  // Videos
  getAllVideos(): Promise<Video[]>;
  getApprovedVideos(): Promise<Video[]>;
  getVideosByType(exerciseType: string): Promise<Video[]>;
  getVideosByTheme(theme: string): Promise<Video[]>;
  getVideo(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, updates: Partial<Video>): Promise<Video>;
  deleteVideo(id: string): Promise<void>;
  
  // Daily Progress
  getDailyProgress(userId: string, date: string): Promise<DailyProgress | undefined>;
  getUserProgress(userId: string): Promise<DailyProgress[]>;
  createDailyProgress(progress: InsertDailyProgress): Promise<DailyProgress>;
  updateDailyProgress(id: string, updates: Partial<DailyProgress>): Promise<DailyProgress>;
  
  // Achievements
  getUserAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  hasAchievement(userId: string, badgeType: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values([insertUser])
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: string): Promise<void> {
    // Delete related data first due to foreign key constraints
    await db.delete(achievements).where(eq(achievements.userId, id));
    await db.delete(dailyProgress).where(eq(dailyProgress.userId, id));
    await db.delete(workoutPlans).where(eq(workoutPlans.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  // Workout Plans
  async getWorkoutPlan(userId: string, day: number): Promise<WorkoutPlan | undefined> {
    const [plan] = await db
      .select()
      .from(workoutPlans)
      .where(and(eq(workoutPlans.userId, userId), eq(workoutPlans.day, day)));
    return plan || undefined;
  }

  async getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    return await db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.userId, userId))
      .orderBy(workoutPlans.day);
  }

  async createWorkoutPlan(insertPlan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const [plan] = await db
      .insert(workoutPlans)
      .values([insertPlan])
      .returning();
    return plan;
  }

  async deleteUserWorkoutPlans(userId: string): Promise<void> {
    await db.delete(workoutPlans).where(eq(workoutPlans.userId, userId));
  }

  // Videos
  async getAllVideos(): Promise<Video[]> {
    return await db.select().from(videos);
  }

  async getApprovedVideos(): Promise<Video[]> {
    return await db.select().from(videos).where(eq(videos.isApproved, true));
  }

  async getVideosByType(exerciseType: string): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(and(eq(videos.exerciseType, exerciseType), eq(videos.isApproved, true)));
  }

  async getVideosByTheme(theme: string): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(eq(videos.isApproved, true));
    // Note: themeCompatibility filtering would need to be done in application code
    // since Drizzle doesn't have built-in JSON array contains operations for all databases
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video || undefined;
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const [video] = await db
      .insert(videos)
      .values([insertVideo])
      .returning();
    return video;
  }

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video> {
    const [video] = await db
      .update(videos)
      .set(updates)
      .where(eq(videos.id, id))
      .returning();
    return video;
  }

  async deleteVideo(id: string): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  // Daily Progress
  async getDailyProgress(userId: string, date: string): Promise<DailyProgress | undefined> {
    const [progress] = await db
      .select()
      .from(dailyProgress)
      .where(eq(dailyProgress.userId, userId));
    // Note: Date filtering would need additional logic based on your date format
    return progress || undefined;
  }

  async getUserProgress(userId: string): Promise<DailyProgress[]> {
    return await db
      .select()
      .from(dailyProgress)
      .where(eq(dailyProgress.userId, userId))
      .orderBy(dailyProgress.date);
  }

  async createDailyProgress(insertProgress: InsertDailyProgress): Promise<DailyProgress> {
    const [progress] = await db
      .insert(dailyProgress)
      .values([insertProgress])
      .returning();
    return progress;
  }

  async updateDailyProgress(id: string, updates: Partial<DailyProgress>): Promise<DailyProgress> {
    const [progress] = await db
      .update(dailyProgress)
      .set(updates)
      .where(eq(dailyProgress.id, id))
      .returning();
    return progress;
  }

  // Achievements
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(achievements.earnedAt);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values([insertAchievement])
      .returning();
    return achievement;
  }

  async hasAchievement(userId: string, badgeType: string): Promise<boolean> {
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(and(eq(achievements.userId, userId), eq(achievements.badgeType, badgeType)));
    return !!achievement;
  }
}

export const storage = new DatabaseStorage();