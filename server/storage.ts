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
  achievements,
} from "@shared/schema";
import { db, dbPromise } from "./db";
import { eq, and } from "drizzle-orm";

// Ensure db is initialized (sql.js loads async)
async function getDb() {
  if (!db) await dbPromise; // populate exported db
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return db!;
}

const toNum = (v: string | number): number =>
  typeof v === "number" ? v : Number(v);

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
  getDailyProgress(
    userId: string,
    date: string
  ): Promise<DailyProgress | undefined>;
  getUserProgress(userId: string): Promise<DailyProgress[]>;
  createDailyProgress(progress: InsertDailyProgress): Promise<DailyProgress>;
  updateDailyProgress(
    id: string,
    updates: Partial<DailyProgress>
  ): Promise<DailyProgress>;

  // Achievements
  getUserAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  hasAchievement(userId: string, badgeType: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const database = await getDb();
    const [user] = await database
      .select()
      .from(users)
      .where(eq(users.id, toNum(id)));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const database = await getDb();
    const [user] = await database
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const database = await getDb();
    const [user] = await database
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const database = await getDb();
    const [user] = await database
      .insert(users)
      .values({ ...insertUser, createdAt: insertUser.createdAt ?? new Date() })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const database = await getDb();
    const [user] = await database
      .update(users)
      .set(updates)
      .where(eq(users.id, toNum(id)))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const database = await getDb();
    return await database.select().from(users);
  }

  async deleteUser(id: string): Promise<void> {
    const database = await getDb();
    // Delete related data first due to foreign key constraints
    const numId = toNum(id);
    await database.delete(achievements).where(eq(achievements.userId, numId));
    await database.delete(dailyProgress).where(eq(dailyProgress.userId, numId));
    await database.delete(workoutPlans).where(eq(workoutPlans.userId, numId));
    await database.delete(users).where(eq(users.id, numId));
  }

  // Workout Plans
  async getWorkoutPlan(
    userId: string,
    day: number
  ): Promise<WorkoutPlan | undefined> {
    const database = await getDb();
    const [plan] = await database
      .select()
      .from(workoutPlans)
      .where(
        and(eq(workoutPlans.userId, toNum(userId)), eq(workoutPlans.day, day))
      );
    return plan || undefined;
  }

  async getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    const database = await getDb();
    return await database
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.userId, toNum(userId)))
      .orderBy(workoutPlans.day);
  }

  async createWorkoutPlan(insertPlan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const database = await getDb();
    const [plan] = await database
      .insert(workoutPlans)
      .values({ ...insertPlan, createdAt: insertPlan.createdAt ?? new Date() })
      .returning();
    return plan;
  }

  async deleteUserWorkoutPlans(userId: string): Promise<void> {
    const database = await getDb();
    await database
      .delete(workoutPlans)
      .where(eq(workoutPlans.userId, toNum(userId)));
  }

  // Videos
  async getAllVideos(): Promise<Video[]> {
    const database = await getDb();
    return await database.select().from(videos);
  }

  async getApprovedVideos(): Promise<Video[]> {
    const database = await getDb();
    return await database.select().from(videos).where(eq(videos.isApproved, 1));
  }

  async getVideosByType(exerciseType: string): Promise<Video[]> {
    const database = await getDb();
    return await database
      .select()
      .from(videos)
      .where(
        and(eq(videos.exerciseType, exerciseType), eq(videos.isApproved, 1))
      );
  }

  async getVideosByTheme(theme: string): Promise<Video[]> {
    const database = await getDb();
    return await database.select().from(videos).where(eq(videos.isApproved, 1));
    // Note: themeCompatibility filtering would need to be done in application code
    // since Drizzle doesn't have built-in JSON array contains operations for all databases
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const database = await getDb();
    const [video] = await database
      .select()
      .from(videos)
      .where(eq(videos.id, toNum(id)));
    return video || undefined;
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const database = await getDb();
    const [video] = await database
      .insert(videos)
      .values({
        ...insertVideo,
        createdAt: insertVideo.createdAt ?? new Date(),
      })
      .returning();
    return video;
  }

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video> {
    const database = await getDb();
    const [video] = await database
      .update(videos)
      .set(updates)
      .where(eq(videos.id, toNum(id)))
      .returning();
    return video;
  }

  async deleteVideo(id: string): Promise<void> {
    const database = await getDb();
    await database.delete(videos).where(eq(videos.id, toNum(id)));
  }

  // Daily Progress
  async getDailyProgress(
    userId: string,
    date: string
  ): Promise<DailyProgress | undefined> {
    const database = await getDb();
    const [progress] = await database
      .select()
      .from(dailyProgress)
      .where(eq(dailyProgress.userId, toNum(userId)));
    // Note: Date filtering would need additional logic based on your date format
    return progress || undefined;
  }

  async getUserProgress(userId: string): Promise<DailyProgress[]> {
    const database = await getDb();
    return await database
      .select()
      .from(dailyProgress)
      .where(eq(dailyProgress.userId, toNum(userId)))
      .orderBy(dailyProgress.date);
  }

  async createDailyProgress(
    insertProgress: InsertDailyProgress
  ): Promise<DailyProgress> {
    const database = await getDb();
    const [progress] = await database
      .insert(dailyProgress)
      .values({
        ...insertProgress,
        createdAt: insertProgress.createdAt ?? new Date(),
      })
      .returning();
    return progress;
  }

  async updateDailyProgress(
    id: string,
    updates: Partial<DailyProgress>
  ): Promise<DailyProgress> {
    const database = await getDb();
    const [progress] = await database
      .update(dailyProgress)
      .set(updates)
      .where(eq(dailyProgress.id, toNum(id)))
      .returning();
    return progress;
  }

  // Achievements
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const database = await getDb();
    return await database
      .select()
      .from(achievements)
      .where(eq(achievements.userId, toNum(userId)))
      .orderBy(achievements.earnedAt);
  }

  async createAchievement(
    insertAchievement: InsertAchievement
  ): Promise<Achievement> {
    const database = await getDb();
    const [achievement] = await database
      .insert(achievements)
      .values({
        ...insertAchievement,
        earnedAt: insertAchievement.earnedAt ?? new Date(),
      })
      .returning();
    return achievement;
  }

  async hasAchievement(userId: string, badgeType: string): Promise<boolean> {
    const database = await getDb();
    const [achievement] = await database
      .select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, toNum(userId)),
          eq(achievements.badgeType, badgeType)
        )
      );
    return !!achievement;
  }
}

export const storage = new DatabaseStorage();
