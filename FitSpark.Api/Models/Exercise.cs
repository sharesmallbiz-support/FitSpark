using System.ComponentModel.DataAnnotations;

namespace FitSpark.Api.Models;

public class Exercise
{
    public int Id { get; set; }

    public int? DailyWorkoutId { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(50)]
    public string Category { get; set; } = string.Empty; // ChairYoga, LightWeights, Walking, Elliptical, Stretching

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

    [StringLength(500)]
    public string? SafetyNotes { get; set; }

    [StringLength(500)]
    public string? Benefits { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsRequired { get; set; } = true;

    public bool IsTemplate { get; set; } = false; // True for exercise catalog, false for workout-specific

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual DailyWorkout? DailyWorkout { get; set; }
}
