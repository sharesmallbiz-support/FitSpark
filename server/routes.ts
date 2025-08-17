import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  generatePersonalizedProgram,
  generateDailyMotivation,
  generateAchievementBadge,
} from "./services/openai";
import {
  insertUserSchema,
  insertVideoSchema,
  insertDailyProgressSchema,
} from "@shared/schema";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const {
        username,
        password,
        name,
        email,
        age,
        startWeight,
        targetWeight,
        selectedTheme,
        fitnessGoals,
      } = req.body;

      // Check if user exists
      const existingUser =
        (await storage.getUserByUsername(username)) ||
        (await storage.getUserByEmail(email));
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        name,
        email,
        age,
        startWeight,
        currentWeight: startWeight,
        targetWeight,
        selectedTheme,
        fitnessGoals: fitnessGoals ? JSON.stringify(fitnessGoals) : undefined,
        createdAt: new Date(),
      } as any);

      // Generate personalized 30-day program
      const videos = await storage.getApprovedVideos();
      const program = await generatePersonalizedProgram({
        name,
        age,
        startWeight,
        targetWeight,
        theme: selectedTheme,
        fitnessGoals: fitnessGoals || {
          primaryGoal: "overall-health",
          timeCommitment: 30,
          fitnessLevel: "beginner",
          healthConcerns: [],
          motivationStyle: selectedTheme,
          preferredActivities: [],
        },
        availableVideos: videos,
      });

      // Save workout plans
      for (const dailyPlan of program) {
        await storage.createWorkoutPlan({
          userId: user.id as any,
          day: dailyPlan.day,
          theme: selectedTheme,
          title: dailyPlan.title,
          description: dailyPlan.description,
          totalMinutes: dailyPlan.totalMinutes,
          exercises: JSON.stringify(dailyPlan.exercises),
          motivationMessage: dailyPlan.motivationMessage,
          createdAt: new Date(),
        } as any);
      }

      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User Routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      const user = await storage.updateUser(req.params.id, updates);
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Workout Plan Routes
  app.get("/api/users/:userId/workout-plan/:day", async (req, res) => {
    try {
      const { userId, day } = req.params;
      const plan = await storage.getWorkoutPlan(userId, parseInt(day));

      if (!plan) {
        return res.status(404).json({ message: "Workout plan not found" });
      }

      res.json(plan);
    } catch (error) {
      console.error("Get workout plan error:", error);
      res.status(500).json({ message: "Failed to get workout plan" });
    }
  });

  app.get("/api/users/:userId/workout-plans", async (req, res) => {
    try {
      const plans = await storage.getUserWorkoutPlans(req.params.userId);
      res.json(plans);
    } catch (error) {
      console.error("Get workout plans error:", error);
      res.status(500).json({ message: "Failed to get workout plans" });
    }
  });

  // Daily Progress Routes
  app.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(req.params.userId);
      res.json(progress);
    } catch (error) {
      console.error("Get progress error:", error);
      res.status(500).json({ message: "Failed to get progress" });
    }
  });

  app.get("/api/users/:userId/progress/:date", async (req, res) => {
    try {
      const { userId, date } = req.params;
      const progress = await storage.getDailyProgress(userId, date);

      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }

      res.json(progress);
    } catch (error) {
      console.error("Get daily progress error:", error);
      res.status(500).json({ message: "Failed to get daily progress" });
    }
  });

  app.post("/api/users/:userId/progress", async (req, res) => {
    try {
      const progressData = { ...req.body, userId: req.params.userId };
      const progress = await storage.createDailyProgress({
        ...progressData,
        exercises: progressData.exercises
          ? JSON.stringify(progressData.exercises)
          : undefined,
        createdAt: new Date(),
      } as any);

      // Check for achievements
      const user = await storage.getUser(req.params.userId);
      if (user && progress.completed) {
        await checkAndAwardAchievements(
          String(user.id),
          user.selectedTheme as any,
          user.name
        );
      }

      res.status(201).json(progress);
    } catch (error) {
      console.error("Create progress error:", error);
      res.status(500).json({ message: "Failed to create progress" });
    }
  });

  app.patch("/api/progress/:id", async (req, res) => {
    try {
      const progress = await storage.updateDailyProgress(
        req.params.id,
        req.body
      );
      res.json(progress);
    } catch (error) {
      console.error("Update progress error:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Achievement Routes
  app.get("/api/users/:userId/achievements", async (req, res) => {
    try {
      const achievements = await storage.getUserAchievements(req.params.userId);
      res.json(achievements);
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });

  // Video Routes
  app.get("/api/videos", async (req, res) => {
    try {
      const { type, theme, approved } = req.query;

      // For admin purposes, default to showing all videos unless specifically requesting only approved
      let videos =
        approved === "true"
          ? await storage.getApprovedVideos()
          : await storage.getAllVideos();

      if (type) {
        videos = videos.filter((v) => v.exerciseType === type);
      }

      if (theme) {
        videos = videos.filter((v) =>
          v.themeCompatibility
            ? v.themeCompatibility.includes(theme as string)
            : false
        );
      }

      res.json(videos);
    } catch (error) {
      console.error("Get videos error:", error);
      res.status(500).json({ message: "Failed to get videos" });
    }
  });

  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      console.error("Get video error:", error);
      res.status(500).json({ message: "Failed to get video" });
    }
  });

  app.post("/api/videos", async (req, res) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(videoData);
      res.status(201).json(video);
    } catch (error) {
      console.error("Create video error:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  app.patch("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.updateVideo(req.params.id, req.body);
      res.json(video);
    } catch (error) {
      console.error("Update video error:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });

  app.delete("/api/videos/:id", async (req, res) => {
    try {
      await storage.deleteVideo(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete video error:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Daily Motivation Route
  app.get("/api/users/:userId/motivation", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const motivation = await generateDailyMotivation(
        (user.selectedTheme as any) || "fun",
        (user.currentDay as any) || 1,
        user.name
      );
      res.json({ message: motivation });
    } catch (error) {
      console.error("Generate motivation error:", error);
      res.status(500).json({ message: "Failed to generate motivation" });
    }
  });

  // Admin User Management Routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(
        ({ password: _, ...user }) => user
      );
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const userData = req.body;

      // Hash password before creating user
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      const user = await storage.createUser(userData);
      const { password: _, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const updates = req.body;

      // Hash password if provided
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      const user = await storage.updateUser(req.params.id, updates);
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Helper function to check and award achievements
  async function checkAndAwardAchievements(
    userId: string,
    theme: string,
    userName: string
  ) {
    const userProgress = await storage.getUserProgress(userId);
    const completedDays = userProgress.filter((p) => p.completed).length;

    // First workout achievement
    if (
      completedDays === 1 &&
      !(await storage.hasAchievement(userId, "first-workout"))
    ) {
      const badge = await generateAchievementBadge(
        "first-workout",
        theme as any,
        userName
      );
      await storage.createAchievement({
        userId: Number(userId),
        badgeType: "first-workout",
        title: badge.title,
        description: badge.description,
        icon: badge.icon,
        theme,
      });
    }

    // First week achievement
    if (
      completedDays === 7 &&
      !(await storage.hasAchievement(userId, "first-week"))
    ) {
      const badge = await generateAchievementBadge(
        "first-week",
        theme as any,
        userName
      );
      await storage.createAchievement({
        userId: Number(userId),
        badgeType: "first-week",
        title: badge.title,
        description: badge.description,
        icon: badge.icon,
        theme,
      });
    }

    // Consistency achievement (5 days in a row)
    const recentProgress = userProgress.slice(-5);
    if (
      recentProgress.length === 5 &&
      recentProgress.every((p) => p.completed) &&
      !(await storage.hasAchievement(userId, "consistency"))
    ) {
      const badge = await generateAchievementBadge(
        "consistency",
        theme as any,
        userName
      );
      await storage.createAchievement({
        userId: Number(userId),
        badgeType: "consistency",
        title: badge.title,
        description: badge.description,
        icon: badge.icon,
        theme,
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
