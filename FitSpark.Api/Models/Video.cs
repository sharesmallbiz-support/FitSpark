using System.ComponentModel.DataAnnotations;

namespace FitSpark.Api.Models;

public class Video
{
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    [StringLength(500)]
    public string YoutubeUrl { get; set; } = string.Empty;

    [StringLength(100)]
    public string? YoutubeVideoId { get; set; }

    [StringLength(50)]
    public string Category { get; set; } = string.Empty; // ChairYoga, LightWeights, Walking, Elliptical, Stretching, Cardio

    [StringLength(20)]
    public string DifficultyLevel { get; set; } = "Beginner";

    [Range(1, 300)]
    public int DurationMinutes { get; set; }

    [StringLength(100)]
    public string? Instructor { get; set; }

    [StringLength(500)]
    public string? Tags { get; set; } // Comma-separated tags

    public bool IsActive { get; set; } = true;

    public bool IsFeatured { get; set; } = false;

    public int ViewCount { get; set; } = 0;

    [Range(1, 5)]
    public decimal? AverageRating { get; set; }

    public int RatingCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<VideoRating> VideoRatings { get; set; } = new List<VideoRating>();
}

public class VideoRating
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int VideoId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [StringLength(1000)]
    public string? Review { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Video Video { get; set; } = null!;
}
