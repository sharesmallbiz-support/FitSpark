using Microsoft.AspNetCore.Mvc;
using FitSpark.Api.Services;
using FitSpark.Api.DTOs;

namespace FitSpark.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExerciseCatalogController : ControllerBase
{
    private readonly IWorkoutService _workoutService;
    private readonly IExerciseCatalogService _catalogService;

    public ExerciseCatalogController(IWorkoutService workoutService, IExerciseCatalogService catalogService)
    {
        _workoutService = workoutService;
        _catalogService = catalogService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExerciseDto>>> GetCatalogExercises(
        [FromQuery] string? category = null,
        [FromQuery] string? difficultyLevel = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var exercises = await _workoutService.GetAllExercisesAsync(category, difficultyLevel, page, pageSize);
        var catalogExercises = exercises?.Where(e => e.IsTemplate) ?? new List<ExerciseDto>();
        return Ok(catalogExercises);
    }

    [HttpGet("{exerciseId}")]
    public async Task<ActionResult<ExerciseDto>> GetCatalogExercise(int exerciseId)
    {
        var exercise = await _workoutService.GetExerciseAsync(exerciseId);
        if (exercise == null || !exercise.IsTemplate)
        {
            return NotFound(new { message = "Exercise not found in catalog" });
        }

        return Ok(exercise);
    }

    [HttpPut("{exerciseId}")]
    public async Task<ActionResult<ExerciseDto>> UpdateCatalogExercise(int exerciseId, [FromBody] UpdateExerciseDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var exercise = await _workoutService.UpdateExerciseAsync(exerciseId, updateDto, 0); // Admin access
        if (exercise == null)
        {
            return NotFound(new { message = "Exercise not found in catalog" });
        }

        return Ok(exercise);
    }

    [HttpPost]
    public async Task<ActionResult<ExerciseDto>> CreateCatalogExercise([FromBody] CreateStandaloneExerciseDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var exercises = await _workoutService.CreateBulkExercisesAsync(new[] { createDto });
        var exercise = exercises.FirstOrDefault();

        if (exercise == null)
        {
            return BadRequest(new { message = "Failed to create exercise" });
        }

        return CreatedAtAction(nameof(GetCatalogExercise), new { exerciseId = exercise.Id }, exercise);
    }

    [HttpDelete("{exerciseId}")]
    public async Task<ActionResult> DeleteCatalogExercise(int exerciseId)
    {
        var success = await _workoutService.DeleteExerciseAsync(exerciseId, 0); // Admin access
        if (!success)
        {
            return NotFound(new { message = "Exercise not found in catalog" });
        }

        return NoContent();
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        var categories = await _workoutService.GetExerciseCategoriesAsync();
        return Ok(categories);
    }

    [HttpPost("reload")]
    public async Task<ActionResult> ReloadChairExercises()
    {
        await _catalogService.LoadChairExercisesAsync();
        return Ok(new { message = "Chair exercises catalog reloaded successfully" });
    }

    [HttpGet("status")]
    public async Task<ActionResult> GetCatalogStatus()
    {
        var isLoaded = await _catalogService.IsChairExercisesCatalogLoadedAsync();
        var categoriesCount = (await _workoutService.GetExerciseCategoriesAsync()).Count();
        var exercisesCount = (await _workoutService.GetAllExercisesAsync()).Count();

        return Ok(new
        {
            IsChairExercisesCatalogLoaded = isLoaded,
            TotalCategories = categoriesCount,
            TotalExercises = exercisesCount
        });
    }
}
