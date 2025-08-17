using System.ComponentModel.DataAnnotations;

namespace FitSpark.Api.DTOs;

public class UserRegistrationDto
{
    [Required]
    [StringLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [Range(18, 120)]
    public int? Age { get; set; }

    [Range(50, 500)]
    public decimal? WeightPounds { get; set; }

    [Range(50, 500)]
    public decimal? TargetWeightPounds { get; set; }

    [StringLength(20)]
    public string? HeightFeet { get; set; }

    [StringLength(20)]
    public string? HeightInches { get; set; }

    [StringLength(20)]
    public string? Gender { get; set; }

    [StringLength(100)]
    public string? FitnessGoal { get; set; }

    [StringLength(20)]
    public string MotivationTheme { get; set; } = "Fun";
}

public class UserLoginDto
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public int? Age { get; set; }
    public decimal? WeightPounds { get; set; }
    public decimal? TargetWeightPounds { get; set; }
    public string? HeightFeet { get; set; }
    public string? HeightInches { get; set; }
    public string? Gender { get; set; }
    public string? FitnessGoal { get; set; }
    public string MotivationTheme { get; set; } = "Fun";
    public string Role { get; set; } = "User";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

public class UserUpdateDto
{
    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [Range(18, 120)]
    public int? Age { get; set; }

    [Range(50, 500)]
    public decimal? WeightPounds { get; set; }

    [Range(50, 500)]
    public decimal? TargetWeightPounds { get; set; }

    [StringLength(20)]
    public string? HeightFeet { get; set; }

    [StringLength(20)]
    public string? HeightInches { get; set; }

    [StringLength(20)]
    public string? Gender { get; set; }

    [StringLength(100)]
    public string? FitnessGoal { get; set; }

    [StringLength(20)]
    public string? MotivationTheme { get; set; }
}
