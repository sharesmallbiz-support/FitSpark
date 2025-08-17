using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitSpark.Api.Data;
using FitSpark.Api.DTOs;
using FitSpark.Api.Models;

namespace FitSpark.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VideosController : ControllerBase
{
    private readonly FitSparkDbContext _context;

    public VideosController(FitSparkDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VideoDto>>> GetVideos(
        [FromQuery] string? category = null,
        [FromQuery] string? difficultyLevel = null,
        [FromQuery] bool? isFeatured = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Videos.Where(v => v.IsActive).AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(v => v.Category == category);

        if (!string.IsNullOrEmpty(difficultyLevel))
            query = query.Where(v => v.DifficultyLevel == difficultyLevel);

        if (isFeatured.HasValue)
            query = query.Where(v => v.IsFeatured == isFeatured.Value);

        var videos = await query
            .OrderByDescending(v => v.IsFeatured)
            .ThenByDescending(v => v.AverageRating)
            .ThenByDescending(v => v.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var videoDtos = videos.Select(MapToVideoDto);
        return Ok(videoDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VideoDto>> GetVideo(int id)
    {
        var video = await _context.Videos
            .FirstOrDefaultAsync(v => v.Id == id && v.IsActive);

        if (video == null)
        {
            return NotFound(new { message = "Video not found" });
        }

        // Increment view count
        video.ViewCount++;
        await _context.SaveChangesAsync();

        return Ok(MapToVideoDto(video));
    }

    [HttpPost]
    public async Task<ActionResult<VideoDto>> CreateVideo([FromBody] CreateVideoDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Extract YouTube video ID from URL
        var youtubeVideoId = ExtractYouTubeVideoId(createDto.YoutubeUrl);

        var video = new Video
        {
            Title = createDto.Title,
            Description = createDto.Description,
            YoutubeUrl = createDto.YoutubeUrl,
            YoutubeVideoId = youtubeVideoId,
            Category = createDto.Category,
            DifficultyLevel = createDto.DifficultyLevel,
            DurationMinutes = createDto.DurationMinutes,
            Instructor = createDto.Instructor,
            Tags = createDto.Tags,
            IsFeatured = createDto.IsFeatured,
            CreatedAt = DateTime.UtcNow
        };

        _context.Videos.Add(video);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVideo), new { id = video.Id }, MapToVideoDto(video));
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        var categories = await _context.Videos
            .Where(v => v.IsActive)
            .Select(v => v.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("featured")]
    public async Task<ActionResult<IEnumerable<VideoDto>>> GetFeaturedVideos([FromQuery] int count = 6)
    {
        var videos = await _context.Videos
            .Where(v => v.IsActive && v.IsFeatured)
            .OrderByDescending(v => v.AverageRating)
            .ThenByDescending(v => v.ViewCount)
            .Take(count)
            .ToListAsync();

        var videoDtos = videos.Select(MapToVideoDto);
        return Ok(videoDtos);
    }

    [HttpPost("{videoId}/rating/user/{userId}")]
    public async Task<ActionResult<VideoRatingDto>> RateVideo(int videoId, int userId, [FromBody] CreateVideoRatingDto ratingDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Check if video exists
        var video = await _context.Videos.FindAsync(videoId);
        if (video == null || !video.IsActive)
        {
            return NotFound(new { message = "Video not found" });
        }

        // Check if user has already rated this video
        var existingRating = await _context.VideoRatings
            .FirstOrDefaultAsync(vr => vr.VideoId == videoId && vr.UserId == userId);

        if (existingRating != null)
        {
            // Update existing rating
            existingRating.Rating = ratingDto.Rating;
            existingRating.Review = ratingDto.Review;
        }
        else
        {
            // Create new rating
            var rating = new VideoRating
            {
                UserId = userId,
                VideoId = videoId,
                Rating = ratingDto.Rating,
                Review = ratingDto.Review,
                CreatedAt = DateTime.UtcNow
            };

            _context.VideoRatings.Add(rating);
            existingRating = rating;
        }

        await _context.SaveChangesAsync();

        // Update video's average rating
        await UpdateVideoAverageRating(videoId);

        var ratingDto_result = new VideoRatingDto
        {
            Id = existingRating.Id,
            UserId = existingRating.UserId,
            VideoId = existingRating.VideoId,
            Rating = existingRating.Rating,
            Review = existingRating.Review,
            CreatedAt = existingRating.CreatedAt
        };

        return Ok(ratingDto_result);
    }

    [HttpGet("{videoId}/ratings")]
    public async Task<ActionResult<IEnumerable<VideoRatingDto>>> GetVideoRatings(int videoId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var ratings = await _context.VideoRatings
            .Where(vr => vr.VideoId == videoId)
            .OrderByDescending(vr => vr.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var ratingDtos = ratings.Select(r => new VideoRatingDto
        {
            Id = r.Id,
            UserId = r.UserId,
            VideoId = r.VideoId,
            Rating = r.Rating,
            Review = r.Review,
            CreatedAt = r.CreatedAt
        });

        return Ok(ratingDtos);
    }

    private async Task UpdateVideoAverageRating(int videoId)
    {
        var video = await _context.Videos.FindAsync(videoId);
        if (video == null) return;

        var ratings = await _context.VideoRatings
            .Where(vr => vr.VideoId == videoId)
            .Select(vr => vr.Rating)
            .ToListAsync();

        if (ratings.Any())
        {
            video.AverageRating = (decimal)ratings.Average();
            video.RatingCount = ratings.Count;
            video.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    private static string? ExtractYouTubeVideoId(string youtubeUrl)
    {
        try
        {
            var uri = new Uri(youtubeUrl);
            if (uri.Host.Contains("youtube.com"))
            {
                var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
                return query["v"];
            }
            else if (uri.Host.Contains("youtu.be"))
            {
                return uri.AbsolutePath.TrimStart('/');
            }
        }
        catch
        {
            // Invalid URL format
        }
        return null;
    }

    private static VideoDto MapToVideoDto(Video video)
    {
        return new VideoDto
        {
            Id = video.Id,
            Title = video.Title,
            Description = video.Description,
            YoutubeUrl = video.YoutubeUrl,
            YoutubeVideoId = video.YoutubeVideoId,
            Category = video.Category,
            DifficultyLevel = video.DifficultyLevel,
            DurationMinutes = video.DurationMinutes,
            Instructor = video.Instructor,
            Tags = video.Tags,
            IsActive = video.IsActive,
            IsFeatured = video.IsFeatured,
            ViewCount = video.ViewCount,
            AverageRating = video.AverageRating,
            RatingCount = video.RatingCount,
            CreatedAt = video.CreatedAt,
            UpdatedAt = video.UpdatedAt
        };
    }
}
