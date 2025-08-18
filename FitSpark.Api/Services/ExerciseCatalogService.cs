using FitSpark.Api.Data;
using FitSpark.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FitSpark.Api.Services;

public interface IExerciseCatalogService
{
    Task LoadChairExercisesAsync();
    Task<bool> IsChairExercisesCatalogLoadedAsync();
}

public class ExerciseCatalogService : IExerciseCatalogService
{
    private readonly FitSparkDbContext _context;

    public ExerciseCatalogService(FitSparkDbContext context)
    {
        _context = context;
    }

    public async Task<bool> IsChairExercisesCatalogLoadedAsync()
    {
        return await _context.Exercises
            .AnyAsync(e => e.IsTemplate && e.Category.Contains("Upper Body"));
    }

    public async Task LoadChairExercisesAsync()
    {
        if (await IsChairExercisesCatalogLoadedAsync())
        {
            return; // Already loaded
        }

        var exercises = GetChairExercises();
        await _context.Exercises.AddRangeAsync(exercises);
        await _context.SaveChangesAsync();
    }

    private static List<Exercise> GetChairExercises()
    {
        var exercises = new List<Exercise>();

        // Upper Body Exercises
        var upperBodyExercises = new[]
        {
            new { Name = "Seated Arm Circles", Description = "Sit tall, extend arms to sides at shoulder height. Make small circles forward (10), then backward (10).", EffortLevel = "Low", Benefits = "Shoulder mobility, circulation", SafetyNotes = "Keep movements small and controlled" },
            new { Name = "Shoulder Blade Squeezes", Description = "Sit upright, pull shoulder blades together, hold 5 seconds.", EffortLevel = "Low", Benefits = "Posture, upper back strength", SafetyNotes = "Avoid hunching shoulders toward ears" },
            new { Name = "Seated Bicep Curls", Description = "Hold light weights or water bottles. Curl one arm at a time toward shoulder, lower slowly.", EffortLevel = "Low-Medium", Benefits = "Arm strength, functional lifting", SafetyNotes = "Start with 1-2 lb weights max" },
            new { Name = "Wall Push-Ups (Chair Assist)", Description = "Stand arm's length from chair back, hands on chair, lean in and push back.", EffortLevel = "Medium", Benefits = "Chest, arms, shoulders", SafetyNotes = "Chair must be against wall for stability" },
            new { Name = "Seated Overhead Press", Description = "Hold light weights, press arms straight up, lower slowly.", EffortLevel = "Medium", Benefits = "Shoulder strength, reaching ability", SafetyNotes = "Stop at shoulder height if limited mobility" },
            new { Name = "Seated Row (with Band)", Description = "Resistance band around feet, pull elbows back, squeeze shoulder blades.", EffortLevel = "Medium", Benefits = "Back strength, posture", SafetyNotes = "Use light resistance band" },
            new { Name = "Wrist Circles", Description = "Extend arms forward, make circles with wrists in both directions.", EffortLevel = "Low", Benefits = "Wrist mobility, circulation", SafetyNotes = "Gentle movement, good for arthritis" },
            new { Name = "Seated Chest Press", Description = "Hold light weights, press forward from chest, return slowly.", EffortLevel = "Medium", Benefits = "Chest, arms, functional pushing", SafetyNotes = "Keep back against chair" },
            new { Name = "Tricep Extensions", Description = "One arm overhead, bend elbow to lower weight behind head, extend.", EffortLevel = "Medium", Benefits = "Arm strength, reaching overhead", SafetyNotes = "Support elbow with other hand" },
            new { Name = "Seated Side Reaches", Description = "Reach one arm overhead and to the opposite side, feel stretch along ribs.", EffortLevel = "Low", Benefits = "Core, shoulder flexibility", SafetyNotes = "Hold chair with opposite hand" }
        };

        var displayOrder = 1;
        foreach (var exercise in upperBodyExercises)
        {
            exercises.Add(new Exercise
            {
                Name = exercise.Name,
                Description = exercise.Description,
                Category = "Upper Body",
                DifficultyLevel = exercise.EffortLevel,
                Benefits = exercise.Benefits,
                SafetyNotes = exercise.SafetyNotes,
                DisplayOrder = displayOrder++,
                IsTemplate = true,
                IsRequired = false,
                Reps = exercise.EffortLevel == "Low" ? 10 : 8,
                Sets = 1,
                CreatedAt = DateTime.UtcNow
            });
        }

        // Core & Abdominal Exercises
        var coreExercises = new[]
        {
            new { Name = "Seated Marching", Description = "Sit tall, lift one knee toward chest, lower, alternate legs like marching.", EffortLevel = "Low-Medium", Benefits = "Hip flexors, core stability", SafetyNotes = "Hold chair seat for balance if needed" },
            new { Name = "Seated Knee-to-Elbow", Description = "Hands behind head, lift right knee to left elbow, alternate sides.", EffortLevel = "Medium", Benefits = "Obliques, coordination", SafetyNotes = "Move slowly, don't force the stretch" },
            new { Name = "Seated Leg Extensions", Description = "Sit back in chair, straighten one leg out, hold 5 seconds, lower.", EffortLevel = "Low-Medium", Benefits = "Thigh strength, knee mobility", SafetyNotes = "Keep knee slightly bent if stiff" },
            new { Name = "Seated Twists", Description = "Hold light ball or clasp hands, rotate torso left and right, keep hips still.", EffortLevel = "Low-Medium", Benefits = "Spinal mobility, obliques", SafetyNotes = "Small movements, no forcing" },
            new { Name = "Seated Forward Reaches", Description = "Extend arms forward, slowly reach toward toes, roll back up vertebra by vertebra.", EffortLevel = "Low", Benefits = "Back flexibility, abdominals", SafetyNotes = "Only go as far as comfortable" },
            new { Name = "Seated Side Bends", Description = "One hand on hip, other arm reaches overhead and bends to opposite side.", EffortLevel = "Low", Benefits = "Core, lateral flexibility", SafetyNotes = "Support weight with hand on chair" },
            new { Name = "Seated Pelvic Tilts", Description = "Sit tall, tilt pelvis forward and back, engaging core muscles.", EffortLevel = "Low", Benefits = "Lower back, core awareness", SafetyNotes = "Small, controlled movements" },
            new { Name = "Seated Heel Raises", Description = "Lift both heels while keeping toes down, hold, lower slowly.", EffortLevel = "Low", Benefits = "Calf strength, circulation", SafetyNotes = "Can also alternate single legs" },
            new { Name = "Seated Ankle Pumps", Description = "Flex and point feet, then circle ankles in both directions.", EffortLevel = "Low", Benefits = "Circulation, ankle mobility", SafetyNotes = "Essential for preventing blood clots" },
            new { Name = "Modified Crunches", Description = "Lean slightly back, hands on chest, engage abs to sit up straight.", EffortLevel = "Medium", Benefits = "Abdominal strength", SafetyNotes = "Don't lean back too far" }
        };

        foreach (var exercise in coreExercises)
        {
            exercises.Add(new Exercise
            {
                Name = exercise.Name,
                Description = exercise.Description,
                Category = "Core & Abdominal",
                DifficultyLevel = exercise.EffortLevel,
                Benefits = exercise.Benefits,
                SafetyNotes = exercise.SafetyNotes,
                DisplayOrder = displayOrder++,
                IsTemplate = true,
                IsRequired = false,
                Reps = exercise.EffortLevel == "Low" ? 12 : 10,
                Sets = 1,
                DurationMinutes = 1,
                CreatedAt = DateTime.UtcNow
            });
        }

        // Lower Body & Balance Exercises
        var lowerBodyExercises = new[]
        {
            new { Name = "Sit-to-Stand", Description = "Sit toward front of chair, stand up slowly without using hands, sit back down.", EffortLevel = "Medium-High", Benefits = "Leg strength, functional movement", SafetyNotes = "Use hands for assistance if needed" },
            new { Name = "Seated Leg Lifts", Description = "Straighten one leg in front, lift foot 6 inches, lower without touching floor.", EffortLevel = "Medium", Benefits = "Thigh strength, balance", SafetyNotes = "Hold chair for support" },
            new { Name = "Seated Calf Raises", Description = "Press through balls of feet to lift heels, lower slowly.", EffortLevel = "Low", Benefits = "Calf strength, circulation", SafetyNotes = "Can add resistance by pressing knees down" },
            new { Name = "Seated Hip Abduction", Description = "Place small pillow between knees, squeeze pillow, hold 5 seconds.", EffortLevel = "Low", Benefits = "Inner thigh strength", SafetyNotes = "Use folded towel if no pillow available" },
            new { Name = "Chair-Supported Balance", Description = "Stand behind chair, lift one foot slightly off ground, hold 10 seconds.", EffortLevel = "Low-Medium", Benefits = "Balance, ankle strength", SafetyNotes = "Hold chair back with both hands" },
            new { Name = "Seated Leg Swings", Description = "Sit sideways in chair, swing outside leg forward and back.", EffortLevel = "Low", Benefits = "Hip mobility, circulation", SafetyNotes = "Keep movements controlled" },
            new { Name = "Seated Hamstring Stretch", Description = "Extend one leg straight, reach gently toward toes, hold 30 seconds.", EffortLevel = "Low", Benefits = "Flexibility, circulation", SafetyNotes = "Don't bounce or force stretch" },
            new { Name = "Standing Hip Extensions", Description = "Stand behind chair, lift one leg straight back, keep torso upright.", EffortLevel = "Medium", Benefits = "Glute strength, hip mobility", SafetyNotes = "Hold chair for support" },
            new { Name = "Seated Figure-4 Stretch", Description = "Ankle on opposite knee, gently press on raised knee.", EffortLevel = "Low", Benefits = "Hip flexibility, posture", SafetyNotes = "Very gentle pressure only" },
            new { Name = "Modified Squats", Description = "Stand and lower halfway down toward chair, stand back up.", EffortLevel = "Medium-High", Benefits = "Leg strength, functional movement", SafetyNotes = "Chair provides safety net" }
        };

        foreach (var exercise in lowerBodyExercises)
        {
            exercises.Add(new Exercise
            {
                Name = exercise.Name,
                Description = exercise.Description,
                Category = "Lower Body & Balance",
                DifficultyLevel = exercise.EffortLevel,
                Benefits = exercise.Benefits,
                SafetyNotes = exercise.SafetyNotes,
                DisplayOrder = displayOrder++,
                IsTemplate = true,
                IsRequired = false,
                Reps = exercise.EffortLevel.Contains("High") ? 5 : exercise.EffortLevel == "Low" ? 12 : 8,
                Sets = 1,
                DurationMinutes = exercise.Name.Contains("Stretch") ? 1 : null,
                CreatedAt = DateTime.UtcNow
            });
        }

        return exercises;
    }
}
