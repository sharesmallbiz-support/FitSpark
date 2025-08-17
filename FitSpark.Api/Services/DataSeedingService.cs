using FitSpark.Api.Data;
using FitSpark.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FitSpark.Api.Services;

public class DataSeedingService
{
    private readonly FitSparkDbContext _context;

    public DataSeedingService(FitSparkDbContext context)
    {
        _context = context;
    }

    public async Task SeedDataAsync()
    {
        // Check if data already exists
        if (await _context.Users.AnyAsync())
        {
            return; // Data already seeded
        }

        await SeedUsersAsync();
        await SeedAchievementsAsync();
        await SeedVideosAsync();
        await SeedWorkoutPlansAsync();
        await SeedProgressDataAsync();

        await _context.SaveChangesAsync();
    }

    private async Task SeedUsersAsync()
    {
        var users = new[]
        {
            new User
            {
                Username = "demo",
                Email = "demo@fitspark.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("demo123"),
                FirstName = "Demo",
                LastName = "User",
                Age = 62,
                WeightPounds = 175m,
                TargetWeightPounds = 165m,
                HeightFeet = "5",
                HeightInches = "8",
                Gender = "Prefer not to say",
                FitnessGoal = "Maintain health and mobility",
                MotivationTheme = "Fun",
                Role = "User",
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                LastLoginAt = DateTime.UtcNow.AddHours(-2)
            },
            new User
            {
                Username = "admin",
                Email = "admin@fitspark.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("demo123"),
                FirstName = "Admin",
                LastName = "User",
                Age = 58,
                WeightPounds = 160m,
                TargetWeightPounds = 155m,
                HeightFeet = "5",
                HeightInches = "6",
                Gender = "Prefer not to say",
                FitnessGoal = "Stay active and help others",
                MotivationTheme = "Aggressive",
                Role = "Admin",
                CreatedAt = DateTime.UtcNow.AddDays(-60),
                LastLoginAt = DateTime.UtcNow.AddMinutes(-30)
            },
            new User
            {
                Username = "mary_johnson",
                Email = "mary.johnson@email.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("mary123"),
                FirstName = "Mary",
                LastName = "Johnson",
                Age = 67,
                WeightPounds = 145m,
                TargetWeightPounds = 140m,
                HeightFeet = "5",
                HeightInches = "4",
                Gender = "Female",
                FitnessGoal = "Improve flexibility and strength",
                MotivationTheme = "DrillSergeant",
                Role = "User",
                CreatedAt = DateTime.UtcNow.AddDays(-15)
            }
        };

        await _context.Users.AddRangeAsync(users);
        await _context.SaveChangesAsync();
    }

    private async Task SeedAchievementsAsync()
    {
        var achievements = new[]
        {
            new Achievement
            {
                Name = "First Step",
                Description = "Complete your first workout session",
                Category = "Milestone",
                Rarity = "Common",
                PointValue = 10,
                CriteriaDescription = "Complete any workout",
                IconUrl = "🎯"
            },
            new Achievement
            {
                Name = "Week Warrior",
                Description = "Complete 7 consecutive days of workouts",
                Category = "Streak",
                Rarity = "Rare",
                PointValue = 50,
                CriteriaDescription = "7-day workout streak",
                IconUrl = "🔥"
            },
            new Achievement
            {
                Name = "Consistency Champion",
                Description = "Complete 30 days of workouts",
                Category = "Consistency",
                Rarity = "Epic",
                PointValue = 100,
                CriteriaDescription = "Complete 30 workouts",
                IconUrl = "👑"
            },
            new Achievement
            {
                Name = "Chair Yoga Master",
                Description = "Complete 10 chair yoga sessions",
                Category = "Performance",
                Rarity = "Rare",
                PointValue = 30,
                CriteriaDescription = "Complete 10 chair yoga exercises",
                IconUrl = "🧘"
            },
            new Achievement
            {
                Name = "Walking Wonder",
                Description = "Walk a total of 50 miles",
                Category = "Performance",
                Rarity = "Epic",
                PointValue = 75,
                CriteriaDescription = "Accumulate 50 miles of walking",
                IconUrl = "🚶"
            }
        };

        await _context.Achievements.AddRangeAsync(achievements);
        await _context.SaveChangesAsync();
    }

    private async Task SeedVideosAsync()
    {
        var videos = new[]
        {
            new Video
            {
                Title = "Gentle Chair Yoga for Seniors",
                Description = "A relaxing 15-minute chair yoga session perfect for beginners",
                YoutubeUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                YoutubeVideoId = "dQw4w9WgXcQ",
                Category = "ChairYoga",
                DifficultyLevel = "Beginner",
                DurationMinutes = 15,
                Instructor = "Sarah Martinez",
                Tags = "gentle,seated,flexibility,seniors",
                IsFeatured = true,
                ViewCount = 1250,
                AverageRating = 4.8m,
                RatingCount = 85
            },
            new Video
            {
                Title = "Light Weight Training for 55+",
                Description = "Safe and effective light weight exercises using 2-5 pound weights",
                YoutubeUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                YoutubeVideoId = "dQw4w9WgXcQ",
                Category = "LightWeights",
                DifficultyLevel = "Beginner",
                DurationMinutes = 20,
                Instructor = "Dr. Mike Chen",
                Tags = "strength,weights,arms,safe",
                IsFeatured = true,
                ViewCount = 980,
                AverageRating = 4.6m,
                RatingCount = 67
            },
            new Video
            {
                Title = "Morning Stretching Routine",
                Description = "Start your day with this gentle 10-minute stretching routine",
                YoutubeUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                YoutubeVideoId = "dQw4w9WgXcQ",
                Category = "Stretching",
                DifficultyLevel = "Beginner",
                DurationMinutes = 10,
                Instructor = "Lisa Thompson",
                Tags = "morning,flexibility,gentle,mobility",
                ViewCount = 756,
                AverageRating = 4.7m,
                RatingCount = 43
            },
            new Video
            {
                Title = "Low-Impact Cardio for Seniors",
                Description = "Heart-healthy cardio exercises that are easy on the joints",
                YoutubeUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                YoutubeVideoId = "dQw4w9WgXcQ",
                Category = "Cardio",
                DifficultyLevel = "Intermediate",
                DurationMinutes = 25,
                Instructor = "Coach Johnson",
                Tags = "cardio,low-impact,heart-health,endurance",
                ViewCount = 623,
                AverageRating = 4.5m,
                RatingCount = 31
            }
        };

        await _context.Videos.AddRangeAsync(videos);
        await _context.SaveChangesAsync();
    }

    private async Task SeedWorkoutPlansAsync()
    {
        var demoUser = await _context.Users.FirstAsync(u => u.Username == "demo");
        var adminUser = await _context.Users.FirstAsync(u => u.Username == "admin");

        // Create workout plan for demo user
        var workoutPlan = new WorkoutPlan
        {
            UserId = demoUser.Id,
            Name = "Gentle Fitness Journey - 30 Days",
            Description = "A personalized 30-day fitness program designed for people over 55, focusing on gentle movement, flexibility, and strength building.",
            DurationDays = 30,
            DifficultyLevel = "Beginner",
            MotivationTheme = "Fun",
            StartDate = DateTime.UtcNow.AddDays(-5),
            EndDate = DateTime.UtcNow.AddDays(25),
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        };

        _context.WorkoutPlans.Add(workoutPlan);
        await _context.SaveChangesAsync();

        // Add daily workouts for the first week
        var dailyWorkouts = new[]
        {
            new DailyWorkout
            {
                WorkoutPlanId = workoutPlan.Id,
                DayNumber = 1,
                Title = "Welcome to Your Fitness Journey!",
                Description = "Let's start with gentle movements to assess your current fitness level.",
                EstimatedDurationMinutes = 20,
                DifficultyLevel = "Beginner",
                MotivationalMessage = "Every journey begins with a single step. You've got this!",
                IsRestDay = false
            },
            new DailyWorkout
            {
                WorkoutPlanId = workoutPlan.Id,
                DayNumber = 2,
                Title = "Chair Yoga & Light Stretching",
                Description = "Focus on flexibility and gentle movement from the comfort of your chair.",
                EstimatedDurationMinutes = 25,
                DifficultyLevel = "Beginner",
                MotivationalMessage = "Movement is medicine. Feel your body thanking you with each stretch!",
                IsRestDay = false
            },
            new DailyWorkout
            {
                WorkoutPlanId = workoutPlan.Id,
                DayNumber = 3,
                Title = "Light Walking & Breathing",
                Description = "A gentle walk combined with mindful breathing exercises.",
                EstimatedDurationMinutes = 30,
                DifficultyLevel = "Beginner",
                MotivationalMessage = "Fresh air and movement - the perfect combination for feeling great!",
                IsRestDay = false
            },
            new DailyWorkout
            {
                WorkoutPlanId = workoutPlan.Id,
                DayNumber = 4,
                Title = "Strength & Balance",
                Description = "Light weight exercises and balance training for stability.",
                EstimatedDurationMinutes = 25,
                DifficultyLevel = "Beginner",
                MotivationalMessage = "Building strength, one rep at a time. You're stronger than you think!",
                IsRestDay = false
            },
            new DailyWorkout
            {
                WorkoutPlanId = workoutPlan.Id,
                DayNumber = 5,
                Title = "Active Recovery",
                Description = "Gentle stretching and relaxation exercises to help your body recover.",
                EstimatedDurationMinutes = 15,
                DifficultyLevel = "Beginner",
                MotivationalMessage = "Rest is just as important as movement. Give your body the care it deserves!",
                IsRestDay = false
            },
            new DailyWorkout
            {
                WorkoutPlanId = workoutPlan.Id,
                DayNumber = 6,
                Title = "Fun Friday Fitness",
                Description = "A mix of your favorite exercises from the week plus something new!",
                EstimatedDurationMinutes = 35,
                DifficultyLevel = "Beginner",
                MotivationalMessage = "It's Friday! Time to celebrate your amazing progress this week!",
                IsRestDay = false
            },
            new DailyWorkout
            {
                WorkoutPlanId = workoutPlan.Id,
                DayNumber = 7,
                Title = "Rest & Reflection",
                Description = "A well-deserved rest day with optional gentle stretching.",
                EstimatedDurationMinutes = 10,
                DifficultyLevel = "Beginner",
                MotivationalMessage = "Take time to appreciate how far you've come. You've completed your first week!",
                IsRestDay = true
            }
        };

        await _context.DailyWorkouts.AddRangeAsync(dailyWorkouts);
        await _context.SaveChangesAsync();

        // Add exercises for Day 1
        var day1Workout = dailyWorkouts[0];
        var day1Exercises = new[]
        {
            new Exercise
            {
                DailyWorkoutId = day1Workout.Id,
                Name = "Seated Marching",
                Description = "Gentle marching motion while seated to warm up your body",
                Category = "ChairYoga",
                DurationMinutes = 5,
                Instructions = "Sit tall in your chair and slowly lift one knee, then the other, as if marching in place.",
                DifficultyLevel = "Beginner",
                DisplayOrder = 1,
                IsRequired = true
            },
            new Exercise
            {
                DailyWorkoutId = day1Workout.Id,
                Name = "Arm Circles",
                Description = "Gentle arm circles to improve shoulder mobility",
                Category = "Stretching",
                Sets = 2,
                Reps = 10,
                Instructions = "Extend your arms to the sides and make small, controlled circles.",
                DifficultyLevel = "Beginner",
                DisplayOrder = 2,
                IsRequired = true
            },
            new Exercise
            {
                DailyWorkoutId = day1Workout.Id,
                Name = "Ankle Pumps",
                Description = "Simple ankle movements to improve circulation",
                Category = "Stretching",
                Sets = 3,
                Reps = 15,
                Instructions = "Flex and point your feet to pump your ankles and improve blood flow.",
                DifficultyLevel = "Beginner",
                DisplayOrder = 3,
                IsRequired = true
            }
        };

        await _context.Exercises.AddRangeAsync(day1Exercises);
        await _context.SaveChangesAsync();
    }

    private async Task SeedProgressDataAsync()
    {
        var demoUser = await _context.Users.FirstAsync(u => u.Username == "demo");
        var workoutPlan = await _context.WorkoutPlans
            .Include(wp => wp.DailyWorkouts)
            .ThenInclude(dw => dw.Exercises)
            .FirstAsync(wp => wp.UserId == demoUser.Id);

        // Add progress for the first 5 days
        var progressEntries = new List<DailyProgress>();
        var currentDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5));

        for (int i = 0; i < 5; i++)
        {
            var dailyWorkout = workoutPlan.DailyWorkouts.FirstOrDefault(dw => dw.DayNumber == i + 1);
            if (dailyWorkout != null)
            {
                var progress = new DailyProgress
                {
                    UserId = demoUser.Id,
                    DailyWorkoutId = dailyWorkout.Id,
                    Date = currentDate.AddDays(i),
                    IsCompleted = i < 4, // First 4 days completed, 5th day in progress
                    MoodRating = 7 + (i % 3), // Varying mood ratings
                    EnergyLevel = 6 + (i % 4),
                    EffortLevel = 7 + (i % 2),
                    ActualDurationMinutes = dailyWorkout.EstimatedDurationMinutes + (-5 + (i * 2)), // Slight variations
                    Notes = i switch
                    {
                        0 => "Felt great to start this journey! A bit nervous but excited.",
                        1 => "Chair yoga was more challenging than expected, but I loved it!",
                        2 => "Beautiful day for a walk. Felt energized afterward.",
                        3 => "Light weights were perfect. Feeling stronger already!",
                        _ => "Taking it easy today, listening to my body."
                    },
                    WeightPounds = 175m - (i * 0.5m), // Gradual weight loss
                    CreatedAt = DateTime.UtcNow.AddDays(-5 + i),
                    CompletedAt = i < 4 ? DateTime.UtcNow.AddDays(-5 + i).AddMinutes(dailyWorkout.EstimatedDurationMinutes) : null
                };

                progressEntries.Add(progress);

                // Add exercise progress for completed workouts
                if (i < 4 && dailyWorkout.Exercises.Any())
                {
                    var exerciseProgressEntries = dailyWorkout.Exercises.Select(exercise => new ExerciseProgress
                    {
                        DailyProgressId = progress.Id,
                        ExerciseId = exercise.Id,
                        IsCompleted = true,
                        ActualSets = exercise.Sets,
                        ActualReps = exercise.Reps,
                        ActualDurationMinutes = exercise.DurationMinutes,
                        DifficultyRating = 7 + (i % 3),
                        Notes = "Completed as planned",
                        CreatedAt = DateTime.UtcNow.AddDays(-5 + i)
                    }).ToList();

                    // Note: We'll add these after saving the daily progress to get the ID
                }
            }
        }

        await _context.DailyProgress.AddRangeAsync(progressEntries);
        await _context.SaveChangesAsync();

        // Award some achievements to the demo user
        var achievements = await _context.Achievements.ToListAsync();
        var userAchievements = new[]
        {
            new UserAchievement
            {
                UserId = demoUser.Id,
                AchievementId = achievements.First(a => a.Name == "First Step").Id,
                EarnedAt = DateTime.UtcNow.AddDays(-4),
                Notes = "Completed first workout session!"
            }
        };

        await _context.UserAchievements.AddRangeAsync(userAchievements);
        await _context.SaveChangesAsync();
    }
}
