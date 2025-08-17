using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitSpark.Api.Data;
using FitSpark.Api.DTOs;
using FitSpark.Api.Models;

namespace FitSpark.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly FitSparkDbContext _context;

    public ProgressController(FitSparkDbContext context)
    {
        _context = context;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<DailyProgressDto>>> GetUserProgress(int userId,
        [FromQuery] DateOnly? startDate = null, [FromQuery] DateOnly? endDate = null)
    {
        var query = _context.DailyProgress
            .Where(dp => dp.UserId == userId)
            .Include(dp => dp.ExerciseProgress)
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(dp => dp.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(dp => dp.Date <= endDate.Value);

        var progress = await query
            .OrderByDescending(dp => dp.Date)
            .ToListAsync();

        var progressDtos = progress.Select(MapToDailyProgressDto);
        return Ok(progressDtos);
    }

    [HttpGet("{progressId}/user/{userId}")]
    public async Task<ActionResult<DailyProgressDto>> GetDailyProgress(int progressId, int userId)
    {
        var progress = await _context.DailyProgress
            .Where(dp => dp.Id == progressId && dp.UserId == userId)
            .Include(dp => dp.ExerciseProgress)
            .FirstOrDefaultAsync();

        if (progress == null)
        {
            return NotFound(new { message = "Progress entry not found" });
        }

        return Ok(MapToDailyProgressDto(progress));
    }

    [HttpPost("user/{userId}")]
    public async Task<ActionResult<DailyProgressDto>> CreateDailyProgress(int userId, [FromBody] CreateDailyProgressDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Verify the daily workout exists and user has access
        var dailyWorkout = await _context.DailyWorkouts
            .Include(dw => dw.WorkoutPlan)
            .FirstOrDefaultAsync(dw => dw.Id == createDto.DailyWorkoutId && dw.WorkoutPlan.UserId == userId);

        if (dailyWorkout == null)
        {
            return BadRequest(new { message = "Daily workout not found or access denied" });
        }

        // Check if progress already exists for this date
        var existingProgress = await _context.DailyProgress
            .FirstOrDefaultAsync(dp => dp.UserId == userId && dp.DailyWorkoutId == createDto.DailyWorkoutId && dp.Date == createDto.Date);

        if (existingProgress != null)
        {
            return BadRequest(new { message = "Progress entry already exists for this date" });
        }

        var progress = new DailyProgress
        {
            UserId = userId,
            DailyWorkoutId = createDto.DailyWorkoutId,
            Date = createDto.Date,
            IsCompleted = createDto.IsCompleted,
            MoodRating = createDto.MoodRating,
            EnergyLevel = createDto.EnergyLevel,
            EffortLevel = createDto.EffortLevel,
            ActualDurationMinutes = createDto.ActualDurationMinutes,
            Notes = createDto.Notes,
            WeightPounds = createDto.WeightPounds,
            SkippedReason = createDto.SkippedReason,
            CreatedAt = DateTime.UtcNow,
            CompletedAt = createDto.IsCompleted ? DateTime.UtcNow : null
        };

        _context.DailyProgress.Add(progress);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDailyProgress), new { progressId = progress.Id, userId = userId }, MapToDailyProgressDto(progress));
    }

    [HttpPut("{progressId}/user/{userId}")]
    public async Task<ActionResult<DailyProgressDto>> UpdateDailyProgress(int progressId, int userId, [FromBody] UpdateDailyProgressDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var progress = await _context.DailyProgress
            .Include(dp => dp.ExerciseProgress)
            .FirstOrDefaultAsync(dp => dp.Id == progressId && dp.UserId == userId);

        if (progress == null)
        {
            return NotFound(new { message = "Progress entry not found" });
        }

        // Update only provided fields
        if (updateDto.IsCompleted.HasValue)
        {
            progress.IsCompleted = updateDto.IsCompleted.Value;
            progress.CompletedAt = updateDto.IsCompleted.Value ? DateTime.UtcNow : null;
        }
        if (updateDto.MoodRating.HasValue) progress.MoodRating = updateDto.MoodRating;
        if (updateDto.EnergyLevel.HasValue) progress.EnergyLevel = updateDto.EnergyLevel;
        if (updateDto.EffortLevel.HasValue) progress.EffortLevel = updateDto.EffortLevel;
        if (updateDto.ActualDurationMinutes.HasValue) progress.ActualDurationMinutes = updateDto.ActualDurationMinutes;
        if (updateDto.Notes != null) progress.Notes = updateDto.Notes;
        if (updateDto.WeightPounds.HasValue) progress.WeightPounds = updateDto.WeightPounds;
        if (updateDto.SkippedReason != null) progress.SkippedReason = updateDto.SkippedReason;

        await _context.SaveChangesAsync();

        return Ok(MapToDailyProgressDto(progress));
    }

    [HttpGet("stats/user/{userId}")]
    public async Task<ActionResult<object>> GetProgressStats(int userId, [FromQuery] int days = 30)
    {
        var cutoffDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));

        var progressEntries = await _context.DailyProgress
            .Where(dp => dp.UserId == userId && dp.Date >= cutoffDate)
            .ToListAsync();

        var stats = new
        {
            TotalWorkouts = progressEntries.Count,
            CompletedWorkouts = progressEntries.Count(p => p.IsCompleted),
            CompletionRate = progressEntries.Count > 0 ? (double)progressEntries.Count(p => p.IsCompleted) / progressEntries.Count * 100 : 0,
            AverageMoodRating = progressEntries.Where(p => p.MoodRating.HasValue).Select(p => p.MoodRating!.Value).DefaultIfEmpty(0).Average(),
            AverageEnergyLevel = progressEntries.Where(p => p.EnergyLevel.HasValue).Select(p => p.EnergyLevel!.Value).DefaultIfEmpty(0).Average(),
            TotalMinutesExercised = progressEntries.Where(p => p.ActualDurationMinutes.HasValue).Sum(p => p.ActualDurationMinutes!.Value),
            CurrentStreak = CalculateCurrentStreak(progressEntries.OrderBy(p => p.Date).ToList()),
            WeightChange = CalculateWeightChange(progressEntries.OrderBy(p => p.Date).ToList())
        };

        return Ok(stats);
    }

    private static int CalculateCurrentStreak(List<DailyProgress> progressEntries)
    {
        if (!progressEntries.Any()) return 0;

        var streak = 0;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        for (var date = today; date >= progressEntries.First().Date; date = date.AddDays(-1))
        {
            var entry = progressEntries.FirstOrDefault(p => p.Date == date);
            if (entry?.IsCompleted == true)
            {
                streak++;
            }
            else
            {
                break;
            }
        }

        return streak;
    }

    private static decimal? CalculateWeightChange(List<DailyProgress> progressEntries)
    {
        var entriesWithWeight = progressEntries.Where(p => p.WeightPounds.HasValue).ToList();
        if (entriesWithWeight.Count < 2) return null;

        var firstWeight = entriesWithWeight.First().WeightPounds!.Value;
        var lastWeight = entriesWithWeight.Last().WeightPounds!.Value;

        return lastWeight - firstWeight;
    }

    private static DailyProgressDto MapToDailyProgressDto(DailyProgress progress)
    {
        return new DailyProgressDto
        {
            Id = progress.Id,
            UserId = progress.UserId,
            DailyWorkoutId = progress.DailyWorkoutId,
            Date = progress.Date,
            IsCompleted = progress.IsCompleted,
            MoodRating = progress.MoodRating,
            EnergyLevel = progress.EnergyLevel,
            EffortLevel = progress.EffortLevel,
            ActualDurationMinutes = progress.ActualDurationMinutes,
            Notes = progress.Notes,
            WeightPounds = progress.WeightPounds,
            SkippedReason = progress.SkippedReason,
            CreatedAt = progress.CreatedAt,
            CompletedAt = progress.CompletedAt,
            ExerciseProgress = progress.ExerciseProgress?.Select(ep => new ExerciseProgressDto
            {
                Id = ep.Id,
                DailyProgressId = ep.DailyProgressId,
                ExerciseId = ep.ExerciseId,
                IsCompleted = ep.IsCompleted,
                ActualSets = ep.ActualSets,
                ActualReps = ep.ActualReps,
                ActualDurationMinutes = ep.ActualDurationMinutes,
                ActualWeightPounds = ep.ActualWeightPounds,
                ActualDistanceMiles = ep.ActualDistanceMiles,
                Notes = ep.Notes,
                DifficultyRating = ep.DifficultyRating,
                CreatedAt = ep.CreatedAt
            }).ToList() ?? new List<ExerciseProgressDto>()
        };
    }
}
