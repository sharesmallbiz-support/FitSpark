using System.ComponentModel.DataAnnotations;

namespace FitSpark.Api.DTOs;

public class WorkoutPlanDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationDays { get; set; }
    public string DifficultyLevel { get; set; } = "Beginner";
    public string MotivationTheme { get; set; } = "Fun";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<DailyWorkoutDto> DailyWorkouts { get; set; } = new();
}

public class CreateWorkoutPlanDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [Range(1, 365)]
    public int DurationDays { get; set; } = 30;

    [StringLength(20)]
    public string DifficultyLevel { get; set; } = "Beginner";

    [StringLength(20)]
    public string MotivationTheme { get; set; } = "Fun";

    public DateTime? StartDate { get; set; }
}

public class DailyWorkoutDto
{
    public int Id { get; set; }
    public int WorkoutPlanId { get; set; }
    public int DayNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public string DifficultyLevel { get; set; } = "Beginner";
    public string? MotivationalMessage { get; set; }
    public bool IsRestDay { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ExerciseDto> Exercises { get; set; } = new();
}

public class CreateDailyWorkoutDto
{
    public int WorkoutPlanId { get; set; }

    [Range(1, 365)]
    public int DayNumber { get; set; }

    [Required]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Range(5, 180)]
    public int EstimatedDurationMinutes { get; set; }

    [StringLength(20)]
    public string DifficultyLevel { get; set; } = "Beginner";

    [StringLength(500)]
    public string? MotivationalMessage { get; set; }

    public bool IsRestDay { get; set; } = false;
}

public class ExerciseDto
{
    public int Id { get; set; }
    public int DailyWorkoutId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public int? Sets { get; set; }
    public int? Reps { get; set; }
    public int? DurationMinutes { get; set; }
    public decimal? WeightPounds { get; set; }
    public decimal? DistanceMiles { get; set; }
    public string? VideoUrl { get; set; }
    public string? VideoTitle { get; set; }
    public string? Instructions { get; set; }
    public string DifficultyLevel { get; set; } = "Beginner";
    public int DisplayOrder { get; set; }
    public bool IsRequired { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateExerciseDto
{
    public int DailyWorkoutId { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(50)]
    public string Category { get; set; } = string.Empty;

    [Range(1, 100)]
    public int? Sets { get; set; }

    [Range(1, 1000)]
    public int? Reps { get; set; }

    [Range(1, 180)]
    public int? DurationMinutes { get; set; }

    [Range(1, 500)]
    public decimal? WeightPounds { get; set; }

    [Range(0.1, 50.0)]
    public decimal? DistanceMiles { get; set; }

    [StringLength(200)]
    public string? VideoUrl { get; set; }

    [StringLength(100)]
    public string? VideoTitle { get; set; }

    [StringLength(500)]
    public string? Instructions { get; set; }

    [StringLength(20)]
    public string DifficultyLevel { get; set; } = "Beginner";

    public int DisplayOrder { get; set; }

    public bool IsRequired { get; set; } = true;
}
