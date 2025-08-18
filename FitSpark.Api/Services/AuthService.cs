using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using FitSpark.Api.Data;
using FitSpark.Api.Models;
using FitSpark.Api.DTOs;

namespace FitSpark.Api.Services;

public interface IAuthService
{
    Task<UserDto?> LoginAsync(UserLoginDto loginDto);
    Task<UserDto?> RegisterAsync(UserRegistrationDto registrationDto);
    Task<UserDto?> GetUserByIdAsync(int userId);
    Task<UserDto?> UpdateUserAsync(int userId, UserUpdateDto updateDto);
}

public class AuthService : IAuthService
{
    private readonly FitSparkDbContext _context;

    public AuthService(FitSparkDbContext context)
    {
        _context = context;
    }

    public async Task<UserDto?> LoginAsync(UserLoginDto loginDto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == loginDto.Username && u.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return null;
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToUserDto(user);
    }

    public async Task<UserDto?> RegisterAsync(UserRegistrationDto registrationDto)
    {
        // Check if username or email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == registrationDto.Username || u.Email == registrationDto.Email);

        if (existingUser != null)
        {
            return null; // User already exists
        }

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(registrationDto.Password);

        var user = new User
        {
            Username = registrationDto.Username,
            Email = registrationDto.Email,
            PasswordHash = hashedPassword,
            FirstName = registrationDto.FirstName,
            LastName = registrationDto.LastName,
            Age = registrationDto.Age,
            WeightPounds = registrationDto.WeightPounds,
            TargetWeightPounds = registrationDto.TargetWeightPounds,
            HeightFeet = registrationDto.HeightFeet,
            HeightInches = registrationDto.HeightInches,
            Gender = registrationDto.Gender,
            FitnessGoal = registrationDto.FitnessGoal,
            MotivationTheme = registrationDto.MotivationTheme,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return MapToUserDto(user);
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

        return user != null ? MapToUserDto(user) : null;
    }

    public async Task<UserDto?> UpdateUserAsync(int userId, UserUpdateDto updateDto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

        if (user == null)
        {
            return null;
        }

        // Update only provided fields
        if (!string.IsNullOrWhiteSpace(updateDto.FirstName)) user.FirstName = updateDto.FirstName;
        if (!string.IsNullOrWhiteSpace(updateDto.LastName)) user.LastName = updateDto.LastName;
        if (updateDto.Age.HasValue) user.Age = updateDto.Age;
        if (updateDto.WeightPounds.HasValue) user.WeightPounds = updateDto.WeightPounds;
        if (updateDto.TargetWeightPounds.HasValue) user.TargetWeightPounds = updateDto.TargetWeightPounds;
        if (!string.IsNullOrWhiteSpace(updateDto.HeightFeet)) user.HeightFeet = updateDto.HeightFeet;
        if (!string.IsNullOrWhiteSpace(updateDto.HeightInches)) user.HeightInches = updateDto.HeightInches;
        if (!string.IsNullOrWhiteSpace(updateDto.Gender)) user.Gender = updateDto.Gender;
        if (!string.IsNullOrWhiteSpace(updateDto.FitnessGoal)) user.FitnessGoal = updateDto.FitnessGoal;
        if (!string.IsNullOrWhiteSpace(updateDto.MotivationTheme)) user.MotivationTheme = updateDto.MotivationTheme;

        await _context.SaveChangesAsync();

        return MapToUserDto(user);
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Age = user.Age,
            WeightPounds = user.WeightPounds,
            TargetWeightPounds = user.TargetWeightPounds,
            HeightFeet = user.HeightFeet,
            HeightInches = user.HeightInches,
            Gender = user.Gender,
            FitnessGoal = user.FitnessGoal,
            MotivationTheme = user.MotivationTheme,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}
