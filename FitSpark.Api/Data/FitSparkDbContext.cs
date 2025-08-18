using Microsoft.EntityFrameworkCore;
using FitSpark.Api.Models;

namespace FitSpark.Api.Data;

public class FitSparkDbContext : DbContext
{
    public FitSparkDbContext(DbContextOptions<FitSparkDbContext> options) : base(options)
    {
    }

    // DbSets
    public DbSet<User> Users { get; set; }
    public DbSet<WorkoutPlan> WorkoutPlans { get; set; }
    public DbSet<DailyWorkout> DailyWorkouts { get; set; }
    public DbSet<Exercise> Exercises { get; set; }
    public DbSet<DailyProgress> DailyProgress { get; set; }
    public DbSet<ExerciseProgress> ExerciseProgress { get; set; }
    public DbSet<Achievement> Achievements { get; set; }
    public DbSet<UserAchievement> UserAchievements { get; set; }
    public DbSet<Video> Videos { get; set; }
    public DbSet<VideoRating> VideoRatings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User entity configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.WeightPounds).HasPrecision(5, 2);
            entity.Property(e => e.TargetWeightPounds).HasPrecision(5, 2);
        });

        // WorkoutPlan entity configuration
        modelBuilder.Entity<WorkoutPlan>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithMany(e => e.WorkoutPlans)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // DailyWorkout entity configuration
        modelBuilder.Entity<DailyWorkout>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.WorkoutPlan)
                  .WithMany(e => e.DailyWorkouts)
                  .HasForeignKey(e => e.WorkoutPlanId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.WorkoutPlanId, e.DayNumber }).IsUnique();
        });

        // Exercise entity configuration
        modelBuilder.Entity<Exercise>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.DailyWorkout)
                  .WithMany(e => e.Exercises)
                  .HasForeignKey(e => e.DailyWorkoutId)
                  .OnDelete(DeleteBehavior.Cascade)
                  .IsRequired(false);
            entity.Property(e => e.WeightPounds).HasPrecision(5, 2);
            entity.Property(e => e.DistanceMiles).HasPrecision(5, 2);
        });

        // DailyProgress entity configuration
        modelBuilder.Entity<DailyProgress>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithMany(e => e.DailyProgress)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.DailyWorkout)
                  .WithMany(e => e.DailyProgress)
                  .HasForeignKey(e => e.DailyWorkoutId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.Property(e => e.WeightPounds).HasPrecision(5, 2);
            entity.HasIndex(e => new { e.UserId, e.DailyWorkoutId, e.Date }).IsUnique();
        });

        // ExerciseProgress entity configuration
        modelBuilder.Entity<ExerciseProgress>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.DailyProgress)
                  .WithMany(e => e.ExerciseProgress)
                  .HasForeignKey(e => e.DailyProgressId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Exercise)
                  .WithMany()
                  .HasForeignKey(e => e.ExerciseId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.Property(e => e.ActualWeightPounds).HasPrecision(5, 2);
            entity.Property(e => e.ActualDistanceMiles).HasPrecision(5, 2);
            entity.HasIndex(e => new { e.DailyProgressId, e.ExerciseId }).IsUnique();
        });

        // Achievement entity configuration
        modelBuilder.Entity<Achievement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // UserAchievement entity configuration
        modelBuilder.Entity<UserAchievement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithMany(e => e.UserAchievements)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Achievement)
                  .WithMany(e => e.UserAchievements)
                  .HasForeignKey(e => e.AchievementId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.UserId, e.AchievementId }).IsUnique();
        });

        // Video entity configuration
        modelBuilder.Entity<Video>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AverageRating).HasPrecision(3, 2);
        });

        // VideoRating entity configuration
        modelBuilder.Entity<VideoRating>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Video)
                  .WithMany(e => e.VideoRatings)
                  .HasForeignKey(e => e.VideoId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.UserId, e.VideoId }).IsUnique();
        });
    }
}
