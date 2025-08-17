using System.ComponentModel.DataAnnotations;

namespace FitSpark.Api.Models;

public class WorkoutPlan
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [Range(1, 365)]
    public int DurationDays { get; set; } = 30;

    [StringLength(20)]
    public string DifficultyLevel { get; set; } = "Beginner"; // Beginner, Intermediate, Advanced

    [StringLength(20)]
    public string MotivationTheme { get; set; } = "Fun"; // Fun, Aggressive, DrillSergeant

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<DailyWorkout> DailyWorkouts { get; set; } = new List<DailyWorkout>();
}

public class DailyWorkout
{
    public int Id { get; set; }

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

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual WorkoutPlan WorkoutPlan { get; set; } = null!;
    public virtual ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();
    public virtual ICollection<DailyProgress> DailyProgress { get; set; } = new List<DailyProgress>();
}
