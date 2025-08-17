using System.ComponentModel.DataAnnotations;

namespace FitSpark.Api.Models;

public class DailyProgress
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int DailyWorkoutId { get; set; }

    public DateOnly Date { get; set; }

    public bool IsCompleted { get; set; } = false;

    [Range(1, 10)]
    public int? MoodRating { get; set; } // 1-10 scale

    [Range(1, 10)]
    public int? EnergyLevel { get; set; } // 1-10 scale

    [Range(1, 10)]
    public int? EffortLevel { get; set; } // 1-10 scale

    [Range(0, 300)]
    public int? ActualDurationMinutes { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [Range(50, 500)]
    public decimal? WeightPounds { get; set; }

    [StringLength(100)]
    public string? SkippedReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual DailyWorkout DailyWorkout { get; set; } = null!;
    public virtual ICollection<ExerciseProgress> ExerciseProgress { get; set; } = new List<ExerciseProgress>();
}

public class ExerciseProgress
{
    public int Id { get; set; }

    public int DailyProgressId { get; set; }

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
    public int? DifficultyRating { get; set; } // 1-10 scale

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual DailyProgress DailyProgress { get; set; } = null!;
    public virtual Exercise Exercise { get; set; } = null!;
}
