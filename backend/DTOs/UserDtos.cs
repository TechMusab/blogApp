using System.ComponentModel.DataAnnotations;

namespace BlogApi.DTOs;

public class UpdateProfileRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}

public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; }
}
