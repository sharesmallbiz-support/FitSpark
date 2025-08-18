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

    // New exercise management methods
    Task<IEnumerable<ExerciseDto>> GetAllExercisesAsync(string? category = null, string? difficultyLevel = null, int page = 1, int pageSize = 50);
    Task<ExerciseDto?> GetExerciseAsync(int exerciseId);
    Task<ExerciseDto?> UpdateExerciseAsync(int exerciseId, UpdateExerciseDto updateDto, int userId);
    Task<bool> DeleteExerciseAsync(int exerciseId, int userId);
    Task<IEnumerable<ExerciseDto>> CreateBulkExercisesAsync(IEnumerable<CreateStandaloneExerciseDto> createDtos);
    Task<IEnumerable<string>> GetExerciseCategoriesAsync();
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
            IsTemplate = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Exercises.Add(exercise);
        await _context.SaveChangesAsync();

        return MapToExerciseDto(exercise);
    }

    public async Task<IEnumerable<ExerciseDto>> GetExercisesForWorkoutAsync(int dailyWorkoutId, int userId)
    {
        var exercises = await _context.Exercises
            .Where(e => e.DailyWorkoutId == dailyWorkoutId && e.DailyWorkout!.WorkoutPlan.UserId == userId)
            .OrderBy(e => e.DisplayOrder)
            .ToListAsync();

        return exercises.Select(MapToExerciseDto);
    }

    public async Task<IEnumerable<ExerciseDto>> GetAllExercisesAsync(string? category = null, string? difficultyLevel = null, int page = 1, int pageSize = 50)
    {
        var query = _context.Exercises.AsQueryable();

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(e => e.Category == category);
        }

        if (!string.IsNullOrEmpty(difficultyLevel))
        {
            query = query.Where(e => e.DifficultyLevel == difficultyLevel);
        }

        var exercises = await query
            .OrderBy(e => e.Category)
            .ThenBy(e => e.DisplayOrder)
            .ThenBy(e => e.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return exercises.Select(MapToExerciseDto);
    }

    public async Task<ExerciseDto?> GetExerciseAsync(int exerciseId)
    {
        var exercise = await _context.Exercises
            .FirstOrDefaultAsync(e => e.Id == exerciseId);

        return exercise != null ? MapToExerciseDto(exercise) : null;
    }

    public async Task<ExerciseDto?> UpdateExerciseAsync(int exerciseId, UpdateExerciseDto updateDto, int userId)
    {
        var exercise = await _context.Exercises
            .Include(e => e.DailyWorkout)
            .ThenInclude(dw => dw!.WorkoutPlan)
            .FirstOrDefaultAsync(e => e.Id == exerciseId);

        if (exercise == null)
        {
            return null;
        }

        // Check if user has permission to update this exercise
        if (exercise.DailyWorkout != null && exercise.DailyWorkout.WorkoutPlan.UserId != userId && !exercise.IsTemplate)
        {
            return null;
        }

        // Update only provided fields
        if (!string.IsNullOrWhiteSpace(updateDto.Name))
        {
            exercise.Name = updateDto.Name;
        }
        if (updateDto.Description != null)
        {
            exercise.Description = updateDto.Description;
        }
        if (!string.IsNullOrWhiteSpace(updateDto.Category))
        {
            exercise.Category = updateDto.Category;
        }
        if (updateDto.Sets.HasValue)
        {
            exercise.Sets = updateDto.Sets;
        }
        if (updateDto.Reps.HasValue)
        {
            exercise.Reps = updateDto.Reps;
        }
        if (updateDto.DurationMinutes.HasValue)
        {
            exercise.DurationMinutes = updateDto.DurationMinutes;
        }
        if (updateDto.WeightPounds.HasValue)
        {
            exercise.WeightPounds = updateDto.WeightPounds;
        }
        if (updateDto.DistanceMiles.HasValue)
        {
            exercise.DistanceMiles = updateDto.DistanceMiles;
        }
        if (updateDto.VideoUrl != null)
        {
            exercise.VideoUrl = updateDto.VideoUrl;
        }
        if (updateDto.VideoTitle != null)
        {
            exercise.VideoTitle = updateDto.VideoTitle;
        }
        if (updateDto.Instructions != null)
        {
            exercise.Instructions = updateDto.Instructions;
        }
        if (!string.IsNullOrWhiteSpace(updateDto.DifficultyLevel))
        {
            exercise.DifficultyLevel = updateDto.DifficultyLevel;
        }
        if (updateDto.DisplayOrder.HasValue)
        {
            exercise.DisplayOrder = updateDto.DisplayOrder.Value;
        }
        if (updateDto.IsRequired.HasValue)
        {
            exercise.IsRequired = updateDto.IsRequired.Value;
        }

        await _context.SaveChangesAsync();

        return MapToExerciseDto(exercise);
    }

    public async Task<bool> DeleteExerciseAsync(int exerciseId, int userId)
    {
        var exercise = await _context.Exercises
            .Include(e => e.DailyWorkout)
            .ThenInclude(dw => dw!.WorkoutPlan)
            .FirstOrDefaultAsync(e => e.Id == exerciseId);

        if (exercise == null)
        {
            return false;
        }

        // Check if user has permission to delete this exercise
        if (exercise.DailyWorkout != null && exercise.DailyWorkout.WorkoutPlan.UserId != userId && !exercise.IsTemplate)
        {
            return false;
        }

        _context.Exercises.Remove(exercise);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<ExerciseDto>> CreateBulkExercisesAsync(IEnumerable<CreateStandaloneExerciseDto> createDtos)
    {
        var exercises = createDtos.Select(dto => new Exercise
        {
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            Sets = dto.Sets,
            Reps = dto.Reps,
            DurationMinutes = dto.DurationMinutes,
            WeightPounds = dto.WeightPounds,
            DistanceMiles = dto.DistanceMiles,
            VideoUrl = dto.VideoUrl,
            VideoTitle = dto.VideoTitle,
            Instructions = dto.Instructions,
            DifficultyLevel = dto.DifficultyLevel,
            SafetyNotes = dto.SafetyNotes,
            Benefits = dto.Benefits,
            DisplayOrder = dto.DisplayOrder,
            IsRequired = dto.IsRequired,
            IsTemplate = true, // These are template exercises for the catalog
            CreatedAt = DateTime.UtcNow
        }).ToList();

        _context.Exercises.AddRange(exercises);
        await _context.SaveChangesAsync();

        return exercises.Select(MapToExerciseDto);
    }

    public async Task<IEnumerable<string>> GetExerciseCategoriesAsync()
    {
        var categories = await _context.Exercises
            .Where(e => !string.IsNullOrEmpty(e.Category))
            .Select(e => e.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return categories;
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
            SafetyNotes = exercise.SafetyNotes,
            Benefits = exercise.Benefits,
            DisplayOrder = exercise.DisplayOrder,
            IsRequired = exercise.IsRequired,
            IsTemplate = exercise.IsTemplate,
            CreatedAt = exercise.CreatedAt
        };
    }
}
