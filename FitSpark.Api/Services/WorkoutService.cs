using Microsoft.EntityFrameworkCore;
using FitSpark.Api.Data;
using FitSpark.Api.Models;
using FitSpark.Api.DTOs;

namespace FitSpark.Api.Services;

public interface IWorkoutService
{
    Task<IEnumerable<WorkoutPlanDto>> GetUserWorkoutPlansAsync(int userId);
    Task<WorkoutPlanDto?> GetWorkoutPlanAsync(int planId, int userId);
    Task<WorkoutPlanDto?> CreateWorkoutPlanAsync(int userId, CreateWorkoutPlanDto createDto);
    Task<WorkoutPlanDto?> UpdateWorkoutPlanAsync(int planId, int userId, UpdateWorkoutPlanDto updateDto);
    Task<WorkoutPlanDto?> UpdateWorkoutPlanStatusAsync(int planId, int userId, bool isActive);
    Task<DailyWorkoutDto?> GetDailyWorkoutAsync(int workoutId, int userId);
    Task<IEnumerable<DailyWorkoutDto>> GetDailyWorkoutsForPlanAsync(int planId, int userId);
    Task<DailyWorkoutDto?> CreateDailyWorkoutAsync(CreateDailyWorkoutDto createDto, int userId);
    Task<ExerciseDto?> CreateExerciseAsync(CreateExerciseDto createDto, int userId);
    Task<IEnumerable<ExerciseDto>> GetExercisesForWorkoutAsync(int dailyWorkoutId, int userId);
}

public class WorkoutService : IWorkoutService
{
    private readonly FitSparkDbContext _context;

    public WorkoutService(FitSparkDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<WorkoutPlanDto>> GetUserWorkoutPlansAsync(int userId)
    {
        var plans = await _context.WorkoutPlans
            .Where(wp => wp.UserId == userId && wp.IsActive)
            .Include(wp => wp.DailyWorkouts)
                .ThenInclude(dw => dw.Exercises)
            .OrderByDescending(wp => wp.CreatedAt)
            .ToListAsync();

        return plans.Select(MapToWorkoutPlanDto);
    }

    public async Task<WorkoutPlanDto?> GetWorkoutPlanAsync(int planId, int userId)
    {
        var plan = await _context.WorkoutPlans
            .Where(wp => wp.Id == planId && wp.UserId == userId && wp.IsActive)
            .Include(wp => wp.DailyWorkouts)
                .ThenInclude(dw => dw.Exercises)
            .FirstOrDefaultAsync();

        return plan != null ? MapToWorkoutPlanDto(plan) : null;
    }

    public async Task<WorkoutPlanDto?> CreateWorkoutPlanAsync(int userId, CreateWorkoutPlanDto createDto)
    {
        var plan = new WorkoutPlan
        {
            UserId = userId,
            Name = createDto.Name,
            Description = createDto.Description,
            DurationDays = createDto.DurationDays,
            DifficultyLevel = createDto.DifficultyLevel,
            MotivationTheme = createDto.MotivationTheme,
            StartDate = createDto.StartDate,
            EndDate = createDto.StartDate?.AddDays(createDto.DurationDays - 1),
            CreatedAt = DateTime.UtcNow
        };

        _context.WorkoutPlans.Add(plan);
        await _context.SaveChangesAsync();

        return MapToWorkoutPlanDto(plan);
    }

    public async Task<WorkoutPlanDto?> UpdateWorkoutPlanAsync(int planId, int userId, UpdateWorkoutPlanDto updateDto)
    {
        var plan = await _context.WorkoutPlans
            .Where(wp => wp.Id == planId && wp.UserId == userId && wp.IsActive)
            .Include(wp => wp.DailyWorkouts)
                .ThenInclude(dw => dw.Exercises)
            .FirstOrDefaultAsync();

        if (plan == null)
        {
            return null;
        }

        // Update only provided fields
        if (!string.IsNullOrWhiteSpace(updateDto.Name))
        {
            plan.Name = updateDto.Name;
        }
        if (updateDto.Description != null)
        {
            plan.Description = updateDto.Description;
        }
        if (updateDto.DurationDays.HasValue)
        {
            plan.DurationDays = updateDto.DurationDays.Value;
            if (plan.StartDate.HasValue)
            {
                plan.EndDate = plan.StartDate.Value.AddDays(plan.DurationDays - 1);
            }
        }
        if (!string.IsNullOrWhiteSpace(updateDto.DifficultyLevel))
        {
            plan.DifficultyLevel = updateDto.DifficultyLevel;
        }
        if (!string.IsNullOrWhiteSpace(updateDto.MotivationTheme))
        {
            plan.MotivationTheme = updateDto.MotivationTheme;
        }
        if (updateDto.StartDate.HasValue)
        {
            plan.StartDate = updateDto.StartDate;
            plan.EndDate = updateDto.StartDate.Value.AddDays(plan.DurationDays - 1);
        }

        await _context.SaveChangesAsync();

        return MapToWorkoutPlanDto(plan);
    }

    public async Task<WorkoutPlanDto?> UpdateWorkoutPlanStatusAsync(int planId, int userId, bool isActive)
    {
        var plan = await _context.WorkoutPlans
            .Where(wp => wp.Id == planId && wp.UserId == userId)
            .Include(wp => wp.DailyWorkouts)
                .ThenInclude(dw => dw.Exercises)
            .FirstOrDefaultAsync();

        if (plan == null)
        {
            return null;
        }

        plan.IsActive = isActive;
        await _context.SaveChangesAsync();

        return MapToWorkoutPlanDto(plan);
    }

    public async Task<DailyWorkoutDto?> GetDailyWorkoutAsync(int workoutId, int userId)
    {
        var workout = await _context.DailyWorkouts
            .Where(dw => dw.Id == workoutId && dw.WorkoutPlan.UserId == userId)
            .Include(dw => dw.Exercises)
            .Include(dw => dw.WorkoutPlan)
            .FirstOrDefaultAsync();

        return workout != null ? MapToDailyWorkoutDto(workout) : null;
    }

    public async Task<IEnumerable<DailyWorkoutDto>> GetDailyWorkoutsForPlanAsync(int planId, int userId)
    {
        var workouts = await _context.DailyWorkouts
            .Where(dw => dw.WorkoutPlanId == planId && dw.WorkoutPlan.UserId == userId)
            .Include(dw => dw.Exercises)
            .OrderBy(dw => dw.DayNumber)
            .ToListAsync();

        return workouts.Select(MapToDailyWorkoutDto);
    }

    public async Task<DailyWorkoutDto?> CreateDailyWorkoutAsync(CreateDailyWorkoutDto createDto, int userId)
    {
        // Verify the workout plan belongs to the user
        var plan = await _context.WorkoutPlans
            .FirstOrDefaultAsync(wp => wp.Id == createDto.WorkoutPlanId && wp.UserId == userId);

        if (plan == null)
        {
            return null;
        }

        var workout = new DailyWorkout
        {
            WorkoutPlanId = createDto.WorkoutPlanId,
            DayNumber = createDto.DayNumber,
            Title = createDto.Title,
            Description = createDto.Description,
            EstimatedDurationMinutes = createDto.EstimatedDurationMinutes,
            DifficultyLevel = createDto.DifficultyLevel,
            MotivationalMessage = createDto.MotivationalMessage,
            IsRestDay = createDto.IsRestDay,
            CreatedAt = DateTime.UtcNow
        };

        _context.DailyWorkouts.Add(workout);
        await _context.SaveChangesAsync();

        return MapToDailyWorkoutDto(workout);
    }

    public async Task<ExerciseDto?> CreateExerciseAsync(CreateExerciseDto createDto, int userId)
    {
        // Verify the daily workout belongs to the user
        var dailyWorkout = await _context.DailyWorkouts
            .Include(dw => dw.WorkoutPlan)
            .FirstOrDefaultAsync(dw => dw.Id == createDto.DailyWorkoutId && dw.WorkoutPlan.UserId == userId);

        if (dailyWorkout == null)
        {
            return null;
        }

        var exercise = new Exercise
        {
            DailyWorkoutId = createDto.DailyWorkoutId,
            Name = createDto.Name,
            Description = createDto.Description,
            Category = createDto.Category,
            Sets = createDto.Sets,
            Reps = createDto.Reps,
            DurationMinutes = createDto.DurationMinutes,
            WeightPounds = createDto.WeightPounds,
            DistanceMiles = createDto.DistanceMiles,
            VideoUrl = createDto.VideoUrl,
            VideoTitle = createDto.VideoTitle,
            Instructions = createDto.Instructions,
            DifficultyLevel = createDto.DifficultyLevel,
            DisplayOrder = createDto.DisplayOrder,
            IsRequired = createDto.IsRequired,
            CreatedAt = DateTime.UtcNow
        };

        _context.Exercises.Add(exercise);
        await _context.SaveChangesAsync();

        return MapToExerciseDto(exercise);
    }

    public async Task<IEnumerable<ExerciseDto>> GetExercisesForWorkoutAsync(int dailyWorkoutId, int userId)
    {
        var exercises = await _context.Exercises
            .Where(e => e.DailyWorkoutId == dailyWorkoutId && e.DailyWorkout.WorkoutPlan.UserId == userId)
            .OrderBy(e => e.DisplayOrder)
            .ToListAsync();

        return exercises.Select(MapToExerciseDto);
    }

    private static WorkoutPlanDto MapToWorkoutPlanDto(WorkoutPlan plan)
    {
        return new WorkoutPlanDto
        {
            Id = plan.Id,
            UserId = plan.UserId,
            Name = plan.Name,
            Description = plan.Description,
            DurationDays = plan.DurationDays,
            DifficultyLevel = plan.DifficultyLevel,
            MotivationTheme = plan.MotivationTheme,
            IsActive = plan.IsActive,
            CreatedAt = plan.CreatedAt,
            StartDate = plan.StartDate,
            EndDate = plan.EndDate,
            DailyWorkouts = plan.DailyWorkouts?.Select(MapToDailyWorkoutDto).ToList() ?? new List<DailyWorkoutDto>()
        };
    }

    private static DailyWorkoutDto MapToDailyWorkoutDto(DailyWorkout workout)
    {
        return new DailyWorkoutDto
        {
            Id = workout.Id,
            WorkoutPlanId = workout.WorkoutPlanId,
            DayNumber = workout.DayNumber,
            Title = workout.Title,
            Description = workout.Description,
            EstimatedDurationMinutes = workout.EstimatedDurationMinutes,
            DifficultyLevel = workout.DifficultyLevel,
            MotivationalMessage = workout.MotivationalMessage,
            IsRestDay = workout.IsRestDay,
            CreatedAt = workout.CreatedAt,
            Exercises = workout.Exercises?.Select(MapToExerciseDto).ToList() ?? new List<ExerciseDto>()
        };
    }

    private static ExerciseDto MapToExerciseDto(Exercise exercise)
    {
        return new ExerciseDto
        {
            Id = exercise.Id,
            DailyWorkoutId = exercise.DailyWorkoutId,
            Name = exercise.Name,
            Description = exercise.Description,
            Category = exercise.Category,
            Sets = exercise.Sets,
            Reps = exercise.Reps,
            DurationMinutes = exercise.DurationMinutes,
            WeightPounds = exercise.WeightPounds,
            DistanceMiles = exercise.DistanceMiles,
            VideoUrl = exercise.VideoUrl,
            VideoTitle = exercise.VideoTitle,
            Instructions = exercise.Instructions,
            DifficultyLevel = exercise.DifficultyLevel,
            DisplayOrder = exercise.DisplayOrder,
            IsRequired = exercise.IsRequired,
            CreatedAt = exercise.CreatedAt
        };
    }
}
