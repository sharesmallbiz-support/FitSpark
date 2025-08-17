using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitSpark.Api.Data;
using FitSpark.Api.DTOs;

namespace FitSpark.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AchievementsController : ControllerBase
{
    private readonly FitSparkDbContext _context;

    public AchievementsController(FitSparkDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AchievementDto>>> GetAchievements([FromQuery] string? category = null)
    {
        var query = _context.Achievements.Where(a => a.IsActive).AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(a => a.Category == category);

        var achievements = await query
            .OrderBy(a => a.Category)
            .ThenBy(a => a.PointValue)
            .ToListAsync();

        var achievementDtos = achievements.Select(a => new AchievementDto
        {
            Id = a.Id,
            Name = a.Name,
            Description = a.Description,
            IconUrl = a.IconUrl,
            Category = a.Category,
            Rarity = a.Rarity,
            PointValue = a.PointValue,
            CriteriaDescription = a.CriteriaDescription,
            IsActive = a.IsActive,
            CreatedAt = a.CreatedAt
        });

        return Ok(achievementDtos);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<UserAchievementDto>>> GetUserAchievements(int userId)
    {
        var userAchievements = await _context.UserAchievements
            .Where(ua => ua.UserId == userId)
            .Include(ua => ua.Achievement)
            .OrderByDescending(ua => ua.EarnedAt)
            .ToListAsync();

        var userAchievementDtos = userAchievements.Select(ua => new UserAchievementDto
        {
            Id = ua.Id,
            UserId = ua.UserId,
            AchievementId = ua.AchievementId,
            EarnedAt = ua.EarnedAt,
            Notes = ua.Notes,
            IsNotified = ua.IsNotified,
            Achievement = new AchievementDto
            {
                Id = ua.Achievement.Id,
                Name = ua.Achievement.Name,
                Description = ua.Achievement.Description,
                IconUrl = ua.Achievement.IconUrl,
                Category = ua.Achievement.Category,
                Rarity = ua.Achievement.Rarity,
                PointValue = ua.Achievement.PointValue,
                CriteriaDescription = ua.Achievement.CriteriaDescription,
                IsActive = ua.Achievement.IsActive,
                CreatedAt = ua.Achievement.CreatedAt
            }
        });

        return Ok(userAchievementDtos);
    }

    [HttpGet("user/{userId}/stats")]
    public async Task<ActionResult<object>> GetUserAchievementStats(int userId)
    {
        var userAchievements = await _context.UserAchievements
            .Where(ua => ua.UserId == userId)
            .Include(ua => ua.Achievement)
            .ToListAsync();

        var totalAchievements = await _context.Achievements.CountAsync(a => a.IsActive);

        var stats = new
        {
            TotalEarned = userAchievements.Count,
            TotalAvailable = totalAchievements,
            TotalPoints = userAchievements.Sum(ua => ua.Achievement.PointValue),
            CompletionPercentage = totalAchievements > 0 ? (double)userAchievements.Count / totalAchievements * 100 : 0,
            ByCategory = userAchievements
                .GroupBy(ua => ua.Achievement.Category)
                .Select(g => new
                {
                    Category = g.Key,
                    Count = g.Count(),
                    Points = g.Sum(ua => ua.Achievement.PointValue)
                }),
            ByRarity = userAchievements
                .GroupBy(ua => ua.Achievement.Rarity)
                .Select(g => new
                {
                    Rarity = g.Key,
                    Count = g.Count()
                }),
            RecentAchievements = userAchievements
                .OrderByDescending(ua => ua.EarnedAt)
                .Take(5)
                .Select(ua => new
                {
                    ua.Achievement.Name,
                    ua.Achievement.IconUrl,
                    ua.EarnedAt,
                    ua.Achievement.PointValue
                })
        };

        return Ok(stats);
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetAchievementCategories()
    {
        var categories = await _context.Achievements
            .Where(a => a.IsActive)
            .Select(a => a.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("leaderboard")]
    public async Task<ActionResult<IEnumerable<object>>> GetLeaderboard([FromQuery] int limit = 10)
    {
        var leaderboard = await _context.Users
            .Where(u => u.IsActive && u.Role == "User")
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.FirstName,
                u.LastName,
                TotalPoints = u.UserAchievements.Sum(ua => ua.Achievement.PointValue),
                AchievementCount = u.UserAchievements.Count()
            })
            .OrderByDescending(u => u.TotalPoints)
            .ThenByDescending(u => u.AchievementCount)
            .Take(limit)
            .ToListAsync();

        return Ok(leaderboard);
    }
}
