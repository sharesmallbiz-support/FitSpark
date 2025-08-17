using System.ComponentModel.DataAnnotations;

namespace FitSpark.Api.Models;

public class Achievement
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(100)]
    public string? IconUrl { get; set; }

    [StringLength(20)]
    public string Category { get; set; } = string.Empty; // Streak, Milestone, Performance, Consistency

    [StringLength(20)]
    public string Rarity { get; set; } = "Common"; // Common, Rare, Epic, Legendary

    public int PointValue { get; set; } = 10;

    [StringLength(500)]
    public string? CriteriaDescription { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<UserAchievement> UserAchievements { get; set; } = new List<UserAchievement>();
}

public class UserAchievement
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int AchievementId { get; set; }

    public DateTime EarnedAt { get; set; } = DateTime.UtcNow;

    [StringLength(500)]
    public string? Notes { get; set; }

    public bool IsNotified { get; set; } = false;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Achievement Achievement { get; set; } = null!;
}
