using Microsoft.AspNetCore.Mvc;
using FitSpark.Api.Services;
using FitSpark.Api.DTOs;

namespace FitSpark.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkoutsController : ControllerBase
{
    private readonly IWorkoutService _workoutService;

    public WorkoutsController(IWorkoutService workoutService)
    {
        _workoutService = workoutService;
    }

    [HttpGet("plans/user/{userId}")]
    public async Task<ActionResult<IEnumerable<WorkoutPlanDto>>> GetUserWorkoutPlans(int userId)
    {
        var plans = await _workoutService.GetUserWorkoutPlansAsync(userId);
        return Ok(plans);
    }

    [HttpGet("plans/{planId}/user/{userId}")]
    public async Task<ActionResult<WorkoutPlanDto>> GetWorkoutPlan(int planId, int userId)
    {
        var plan = await _workoutService.GetWorkoutPlanAsync(planId, userId);
        if (plan == null)
        {
            return NotFound(new { message = "Workout plan not found" });
        }

        return Ok(plan);
    }

    [HttpPost("plans/user/{userId}")]
    public async Task<ActionResult<WorkoutPlanDto>> CreateWorkoutPlan(int userId, [FromBody] CreateWorkoutPlanDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var plan = await _workoutService.CreateWorkoutPlanAsync(userId, createDto);
        if (plan == null)
        {
            return BadRequest(new { message = "Failed to create workout plan" });
        }

        return CreatedAtAction(nameof(GetWorkoutPlan), new { planId = plan.Id, userId = userId }, plan);
    }

    [HttpPut("plans/{planId}/user/{userId}")]
    public async Task<ActionResult<WorkoutPlanDto>> UpdateWorkoutPlan(int planId, int userId, [FromBody] UpdateWorkoutPlanDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var plan = await _workoutService.UpdateWorkoutPlanAsync(planId, userId, updateDto);
        if (plan == null)
        {
            return NotFound(new { message = "Workout plan not found" });
        }

        return Ok(plan);
    }

    [HttpPut("plans/{planId}/user/{userId}/status")]
    public async Task<ActionResult<WorkoutPlanDto>> UpdateWorkoutPlanStatus(int planId, int userId, [FromBody] UpdateWorkoutPlanStatusDto statusDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var plan = await _workoutService.UpdateWorkoutPlanStatusAsync(planId, userId, statusDto.IsActive);
        if (plan == null)
        {
            return NotFound(new { message = "Workout plan not found" });
        }

        return Ok(plan);
    }

    [HttpGet("daily/{workoutId}/user/{userId}")]
    public async Task<ActionResult<DailyWorkoutDto>> GetDailyWorkout(int workoutId, int userId)
    {
        var workout = await _workoutService.GetDailyWorkoutAsync(workoutId, userId);
        if (workout == null)
        {
            return NotFound(new { message = "Daily workout not found" });
        }

        return Ok(workout);
    }

    [HttpGet("daily/plan/{planId}/user/{userId}")]
    public async Task<ActionResult<IEnumerable<DailyWorkoutDto>>> GetDailyWorkoutsForPlan(int planId, int userId)
    {
        var workouts = await _workoutService.GetDailyWorkoutsForPlanAsync(planId, userId);
        return Ok(workouts);
    }

    [HttpPost("daily/user/{userId}")]
    public async Task<ActionResult<DailyWorkoutDto>> CreateDailyWorkout(int userId, [FromBody] CreateDailyWorkoutDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var workout = await _workoutService.CreateDailyWorkoutAsync(createDto, userId);
        if (workout == null)
        {
            return BadRequest(new { message = "Failed to create daily workout" });
        }

        return CreatedAtAction(nameof(GetDailyWorkout), new { workoutId = workout.Id, userId = userId }, workout);
    }

    [HttpGet("exercises/workout/{dailyWorkoutId}/user/{userId}")]
    public async Task<ActionResult<IEnumerable<ExerciseDto>>> GetExercisesForWorkout(int dailyWorkoutId, int userId)
    {
        var exercises = await _workoutService.GetExercisesForWorkoutAsync(dailyWorkoutId, userId);
        return Ok(exercises);
    }

    [HttpPost("exercises/user/{userId}")]
    public async Task<ActionResult<ExerciseDto>> CreateExercise(int userId, [FromBody] CreateExerciseDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var exercise = await _workoutService.CreateExerciseAsync(createDto, userId);
        if (exercise == null)
        {
            return BadRequest(new { message = "Failed to create exercise" });
        }

        return CreatedAtAction(nameof(GetExercisesForWorkout),
            new { dailyWorkoutId = exercise.DailyWorkoutId, userId = userId }, exercise);
    }

    [HttpGet("exercises")]
    public async Task<ActionResult<IEnumerable<ExerciseDto>>> GetAllExercises(
        [FromQuery] string? category = null,
        [FromQuery] string? difficultyLevel = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var exercises = await _workoutService.GetAllExercisesAsync(category, difficultyLevel, page, pageSize);
        return Ok(exercises);
    }

    [HttpGet("exercises/{exerciseId}")]
    public async Task<ActionResult<ExerciseDto>> GetExercise(int exerciseId)
    {
        var exercise = await _workoutService.GetExerciseAsync(exerciseId);
        if (exercise == null)
        {
            return NotFound(new { message = "Exercise not found" });
        }

        return Ok(exercise);
    }

    [HttpPut("exercises/{exerciseId}/user/{userId}")]
    public async Task<ActionResult<ExerciseDto>> UpdateExercise(int exerciseId, int userId, [FromBody] UpdateExerciseDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var exercise = await _workoutService.UpdateExerciseAsync(exerciseId, updateDto, userId);
        if (exercise == null)
        {
            return NotFound(new { message = "Exercise not found" });
        }

        return Ok(exercise);
    }

    [HttpDelete("exercises/{exerciseId}/user/{userId}")]
    public async Task<ActionResult> DeleteExercise(int exerciseId, int userId)
    {
        var success = await _workoutService.DeleteExerciseAsync(exerciseId, userId);
        if (!success)
        {
            return NotFound(new { message = "Exercise not found" });
        }

        return NoContent();
    }

    [HttpPost("exercises/bulk")]
    public async Task<ActionResult<IEnumerable<ExerciseDto>>> CreateBulkExercises([FromBody] IEnumerable<CreateStandaloneExerciseDto> createDtos)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var exercises = await _workoutService.CreateBulkExercisesAsync(createDtos);
        return Ok(exercises);
    }

    [HttpGet("exercises/categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetExerciseCategories()
    {
        var categories = await _workoutService.GetExerciseCategoriesAsync();
        return Ok(categories);
    }
}
