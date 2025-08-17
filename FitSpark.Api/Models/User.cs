using System.ComponentModel.DataAnnotations;

namespace FitSpark.Api.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [Range(18, 120)]
    public int? Age { get; set; }

    [Range(50, 500)]
    public decimal? WeightPounds { get; set; }

    [Range(50, 500)]
    public decimal? TargetWeightPounds { get; set; }

    [StringLength(20)]
    public string? HeightFeet { get; set; }

    [StringLength(20)]
    public string? HeightInches { get; set; }

    [StringLength(20)]
    public string? Gender { get; set; }

    [StringLength(100)]
    public string? FitnessGoal { get; set; }

    [StringLength(20)]
    public string MotivationTheme { get; set; } = "Fun"; // Fun, Aggressive, DrillSergeant

    [StringLength(20)]
    public string Role { get; set; } = "User"; // User, Admin

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public virtual ICollection<WorkoutPlan> WorkoutPlans { get; set; } = new List<WorkoutPlan>();
    public virtual ICollection<DailyProgress> DailyProgress { get; set; } = new List<DailyProgress>();
    public virtual ICollection<UserAchievement> UserAchievements { get; set; } = new List<UserAchievement>();
}
