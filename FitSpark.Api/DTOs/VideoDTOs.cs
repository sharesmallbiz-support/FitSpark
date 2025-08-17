using System.ComponentModel.DataAnnotations;

namespace FitSpark.Api.DTOs;

public class VideoDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string YoutubeUrl { get; set; } = string.Empty;
    public string? YoutubeVideoId { get; set; }
    public string Category { get; set; } = string.Empty;
    public string DifficultyLevel { get; set; } = "Beginner";
    public int DurationMinutes { get; set; }
    public string? Instructor { get; set; }
    public string? Tags { get; set; }
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public int ViewCount { get; set; }
    public decimal? AverageRating { get; set; }
    public int RatingCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateVideoDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    [StringLength(500)]
    public string YoutubeUrl { get; set; } = string.Empty;

    [StringLength(50)]
    public string Category { get; set; } = string.Empty;

    [StringLength(20)]
    public string DifficultyLevel { get; set; } = "Beginner";

    [Range(1, 300)]
    public int DurationMinutes { get; set; }

    [StringLength(100)]
    public string? Instructor { get; set; }

    [StringLength(500)]
    public string? Tags { get; set; }

    public bool IsFeatured { get; set; } = false;
}

public class VideoRatingDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int VideoId { get; set; }
    public int Rating { get; set; }
    public string? Review { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateVideoRatingDto
{
    public int VideoId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [StringLength(1000)]
    public string? Review { get; set; }
}

public class AchievementDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Rarity { get; set; } = "Common";
    public int PointValue { get; set; }
    public string? CriteriaDescription { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserAchievementDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int AchievementId { get; set; }
    public DateTime EarnedAt { get; set; }
    public string? Notes { get; set; }
    public bool IsNotified { get; set; }
    public AchievementDto Achievement { get; set; } = null!;
}
