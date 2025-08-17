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
}
