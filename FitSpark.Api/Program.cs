using Microsoft.EntityFrameworkCore;
using FitSpark.Api.Data;
using FitSpark.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Entity Framework with SQLite
builder.Services.AddDbContext<FitSparkDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ??
                      "Data Source=FitSpark.db"));

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IWorkoutService, WorkoutService>();
builder.Services.AddScoped<IExerciseCatalogService, ExerciseCatalogService>();
builder.Services.AddScoped<DataSeedingService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
        {
            builder
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        }
        else
        {
            // In production, only allow same origin since client is served from API
            builder
                .WithOrigins("https://localhost:7000", "https://localhost:5001") // Add your production URLs here
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable static files serving from wwwroot
app.UseStaticFiles();

app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers();

// SPA fallback - serve index.html for non-API routes
app.MapFallbackToFile("index.html");

// Ensure database is created and seeded
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<FitSparkDbContext>();
    var seedingService = scope.ServiceProvider.GetRequiredService<DataSeedingService>();
    var exerciseCatalogService = scope.ServiceProvider.GetRequiredService<IExerciseCatalogService>();

    try
    {
        await context.Database.EnsureCreatedAsync();
        await seedingService.SeedDataAsync();
        await exerciseCatalogService.LoadChairExercisesAsync();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating/seeding the database.");
    }
}

app.Run();
