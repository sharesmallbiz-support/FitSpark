using System.ComponentModel.DataAnnotations;

namespace FitSpark.Api.DTOs;

public class DailyProgressDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int DailyWorkoutId { get; set; }
    public DateOnly Date { get; set; }
    public bool IsCompleted { get; set; }
    public int? MoodRating { get; set; }
    public int? EnergyLevel { get; set; }
    public int? EffortLevel { get; set; }
    public int? ActualDurationMinutes { get; set; }
    public string? Notes { get; set; }
    public decimal? WeightPounds { get; set; }
    public string? SkippedReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public List<ExerciseProgressDto> ExerciseProgress { get; set; } = new();
}

public class CreateDailyProgressDto
{
    public int DailyWorkoutId { get; set; }

    public DateOnly Date { get; set; }

    public bool IsCompleted { get; set; } = false;

    [Range(1, 10)]
    public int? MoodRating { get; set; }

    [Range(1, 10)]
    public int? EnergyLevel { get; set; }

    [Range(1, 10)]
    public int? EffortLevel { get; set; }

    [Range(0, 300)]
    public int? ActualDurationMinutes { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [Range(50, 500)]
    public decimal? WeightPounds { get; set; }

    [StringLength(100)]
    public string? SkippedReason { get; set; }
}

public class UpdateDailyProgressDto
{
    public bool? IsCompleted { get; set; }

    [Range(1, 10)]
    public int? MoodRating { get; set; }

    [Range(1, 10)]
    public int? EnergyLevel { get; set; }

    [Range(1, 10)]
    public int? EffortLevel { get; set; }

    [Range(0, 300)]
    public int? ActualDurationMinutes { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [Range(50, 500)]
    public decimal? WeightPounds { get; set; }

    [StringLength(100)]
    public string? SkippedReason { get; set; }
}

public class ExerciseProgressDto
{
    public int Id { get; set; }
    public int DailyProgressId { get; set; }
    public int ExerciseId { get; set; }
    public bool IsCompleted { get; set; }
    public int? ActualSets { get; set; }
    public int? ActualReps { get; set; }
    public int? ActualDurationMinutes { get; set; }
    public decimal? ActualWeightPounds { get; set; }
    public decimal? ActualDistanceMiles { get; set; }
    public string? Notes { get; set; }
    public int? DifficultyRating { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateExerciseProgressDto
{
    public int ExerciseId { get; set; }

    public bool IsCompleted { get; set; } = false;

    [Range(1, 100)]
    public int? ActualSets { get; set; }

    [Range(1, 1000)]
    public int? ActualReps { get; set; }

    [Range(1, 180)]
    public int? ActualDurationMinutes { get; set; }

    [Range(1, 500)]
    public decimal? ActualWeightPounds { get; set; }

    [Range(0.1, 50.0)]
    public decimal? ActualDistanceMiles { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    [Range(1, 10)]
    public int? DifficultyRating { get; set; }
}
