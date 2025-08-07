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
  type InsertAchievement
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
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

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private workoutPlans: Map<string, WorkoutPlan> = new Map();
  private videos: Map<string, Video> = new Map();
  private dailyProgress: Map<string, DailyProgress> = new Map();
  private achievements: Map<string, Achievement> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed demo user for evaluation
    const demoUser: User = {
      id: 'demo-user-123',
      username: 'demo',
      password: '$2b$10$K8zB8YxhMVp4OQ7L6/wNPOkF4D5HrNnEo4X9Vj2WpAzD3Qy6U8Smt2', // password: 'demo123'
      name: 'Demo User',
      email: 'demo@fitspark.com',
      age: 58,
      startWeight: 190,
      currentWeight: 185,
      targetWeight: 175,
      selectedTheme: 'fun',
      currentDay: 5,
      startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      isAdmin: false,
      preferences: {
        notifications: true,
        reminderTime: '09:00',
        weeklyGoalMinutes: 175
      }
    };
    this.users.set(demoUser.id, demoUser);

    // Add admin demo user
    const adminUser: User = {
      id: 'admin-demo-456',
      username: 'admin',
      password: '$2b$10$K8zB8YxhMVp4OQ7L6/wNPOkF4D5HrNnEo4X9Vj2WpAzD3Qy6U8Smt2', // password: 'demo123'
      name: 'Admin User',
      email: 'admin@fitspark.com',
      age: 45,
      startWeight: 180,
      currentWeight: 180,
      targetWeight: 170,
      selectedTheme: 'aggressive',
      currentDay: 1,
      startDate: new Date(),
      isAdmin: true,
      preferences: {
        notifications: true,
        reminderTime: '08:00',
        weeklyGoalMinutes: 200
      }
    };
    this.users.set(adminUser.id, adminUser);

    // Add sample progress for demo user
    for (let i = 1; i <= 4; i++) {
      const progress: DailyProgress = {
        id: `progress-${i}`,
        userId: demoUser.id,
        day: i,
        date: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000),
        completed: true,
        minutesCompleted: 25 + Math.floor(Math.random() * 10),
        weight: 190 - i,
        mood: Math.floor(Math.random() * 5) + 1,
        exercises: [
          { name: 'Chair Yoga', completed: true, duration: 15 },
          { name: 'Light Weights', completed: true, duration: 10 }
        ] as { name: string; completed: boolean; duration: number; }[],
        notes: i === 1 ? 'Great first day!' : i === 4 ? 'Feeling stronger!' : null
      };
      this.dailyProgress.set(progress.id, progress);
    }

    // Add sample achievements for demo user
    const achievements: Achievement[] = [
      {
        id: 'achievement-1',
        userId: demoUser.id,
        badgeType: 'first-workout',
        title: 'First Steps',
        description: 'Completed your first workout!',
        theme: 'fun',
        icon: '🎉',
        earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'achievement-2',
        userId: demoUser.id,
        badgeType: 'week-1',
        title: 'Week Warrior',
        description: 'Completed your first week!',
        theme: 'fun',
        icon: '💪',
        earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];
    achievements.forEach(achievement => this.achievements.set(achievement.id, achievement));

    // Add comprehensive video library for evaluation
    const sampleVideos: (InsertVideo & { id: string, isApproved: boolean, createdAt: Date })[] = [
      {
        id: randomUUID(),
        title: "Chair Yoga for Beginners - Morning Routine",
        youtubeId: "KpOle6t47ak",
        duration: 20,
        exerciseType: "chair-yoga",
        skillLevel: "beginner",
        effortLevel: 2,
        equipment: "none",
        themeCompatibility: ["fun", "drill"] as string[],
        description: "Gentle morning chair yoga routine perfect for beginners" as string | null,
        thumbnailUrl: "",
        isApproved: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Chair Exercises with Light Weights",
        youtubeId: "Q5HmYP7gPeQ",
        duration: 15,
        exerciseType: "weights",
        skillLevel: "beginner",
        effortLevel: 3,
        equipment: "light-weights",
        themeCompatibility: ["aggressive", "drill"],
        description: "Upper body strengthening with light dumbbells from your chair",
        thumbnailUrl: "",
        isApproved: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Fun Chair Yoga Flow",
        youtubeId: "BWy7EvlL7lE",
        duration: 25,
        exerciseType: "chair-yoga",
        skillLevel: "beginner",
        effortLevel: 2,
        equipment: "none",
        themeCompatibility: ["fun"],
        description: "Upbeat and enjoyable chair yoga session",
        thumbnailUrl: "",
        isApproved: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Seated Strength Training",
        youtubeId: "vOgxWp0-9BE",
        duration: 30,
        exerciseType: "weights",
        skillLevel: "intermediate",
        effortLevel: 4,
        equipment: "light-weights",
        themeCompatibility: ["aggressive", "drill"],
        description: "Challenging seated strength training routine",
        thumbnailUrl: "",
        isApproved: true,
        createdAt: new Date(),
      }
    ];

    sampleVideos.forEach(video => {
      this.videos.set(video.id, video);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      currentDay: 1,
      startDate: new Date(),
      isAdmin: false,
      age: insertUser.age || null,
      startWeight: insertUser.startWeight || null,
      currentWeight: insertUser.currentWeight || null,
      targetWeight: insertUser.targetWeight || null,
      selectedTheme: insertUser.selectedTheme || 'fun',
      preferences: {
        notifications: true,
        reminderTime: "09:00",
        weeklyGoalMinutes: 175
      }
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    const updatedUser = { ...existingUser, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Workout Plans
  async getWorkoutPlan(userId: string, day: number): Promise<WorkoutPlan | undefined> {
    return Array.from(this.workoutPlans.values())
      .find(plan => plan.userId === userId && plan.day === day);
  }

  async getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    return Array.from(this.workoutPlans.values())
      .filter(plan => plan.userId === userId)
      .sort((a, b) => a.day - b.day);
  }

  async createWorkoutPlan(insertPlan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const id = randomUUID();
    const plan: WorkoutPlan = { 
      ...insertPlan, 
      id,
      description: insertPlan.description || null,
      motivationMessage: insertPlan.motivationMessage || null,
      exercises: insertPlan.exercises as { name: string; duration: number; videoId?: string; instructions: string; }[],
      createdAt: new Date()
    };
    this.workoutPlans.set(id, plan);
    return plan;
  }

  async deleteUserWorkoutPlans(userId: string): Promise<void> {
    const userPlans = Array.from(this.workoutPlans.entries())
      .filter(([_, plan]) => plan.userId === userId);
    
    userPlans.forEach(([id, _]) => {
      this.workoutPlans.delete(id);
    });
  }

  // Videos
  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async getApprovedVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(video => video.isApproved);
  }

  async getVideosByType(exerciseType: string): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter(video => video.exerciseType === exerciseType && video.isApproved);
  }

  async getVideosByTheme(theme: string): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter(video => video.themeCompatibility.includes(theme) && video.isApproved);
  }

  async getVideo(id: string): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const video: Video = { 
      ...insertVideo, 
      id,
      equipment: insertVideo.equipment || null,
      description: insertVideo.description || null,
      thumbnailUrl: insertVideo.thumbnailUrl || null,
      themeCompatibility: insertVideo.themeCompatibility as string[],
      isApproved: false,
      createdAt: new Date()
    };
    this.videos.set(id, video);
    return video;
  }

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video> {
    const existingVideo = this.videos.get(id);
    if (!existingVideo) {
      throw new Error("Video not found");
    }
    const updatedVideo = { ...existingVideo, ...updates };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async deleteVideo(id: string): Promise<void> {
    this.videos.delete(id);
  }

  // Daily Progress
  async getDailyProgress(userId: string, date: string): Promise<DailyProgress | undefined> {
    const targetDate = new Date(date).toDateString();
    return Array.from(this.dailyProgress.values())
      .find(progress => 
        progress.userId === userId && 
        progress.date && new Date(progress.date).toDateString() === targetDate
      );
  }

  async getUserProgress(userId: string): Promise<DailyProgress[]> {
    return Array.from(this.dailyProgress.values())
      .filter(progress => progress.userId === userId)
      .sort((a, b) => (a.date ? new Date(a.date).getTime() : 0) - (b.date ? new Date(b.date).getTime() : 0));
  }

  async createDailyProgress(insertProgress: InsertDailyProgress): Promise<DailyProgress> {
    const id = randomUUID();
    const progress: DailyProgress = { 
      ...insertProgress, 
      id,
      minutesCompleted: insertProgress.minutesCompleted || null,
      weight: insertProgress.weight || null,
      completed: insertProgress.completed || null,
      exercises: (insertProgress.exercises as { name: string; completed: boolean; duration: number; }[]) || null,
      notes: insertProgress.notes || null,
      mood: insertProgress.mood || null,
      date: new Date()
    };
    this.dailyProgress.set(id, progress);
    return progress;
  }

  async updateDailyProgress(id: string, updates: Partial<DailyProgress>): Promise<DailyProgress> {
    const existingProgress = this.dailyProgress.get(id);
    if (!existingProgress) {
      throw new Error("Daily progress not found");
    }
    const updatedProgress = { ...existingProgress, ...updates };
    this.dailyProgress.set(id, updatedProgress);
    return updatedProgress;
  }

  // Achievements
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.userId === userId)
      .sort((a, b) => (b.earnedAt ? new Date(b.earnedAt).getTime() : 0) - (a.earnedAt ? new Date(a.earnedAt).getTime() : 0));
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = randomUUID();
    const achievement: Achievement = { 
      ...insertAchievement, 
      id,
      earnedAt: new Date()
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  async hasAchievement(userId: string, badgeType: string): Promise<boolean> {
    return Array.from(this.achievements.values())
      .some(achievement => 
        achievement.userId === userId && achievement.badgeType === badgeType
      );
  }
}

export const storage = new MemStorage();
