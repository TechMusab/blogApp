using System.ComponentModel.DataAnnotations;
using BlogApi.Models;

namespace BlogApi.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public DateTime CreatedAt { get; set; }
    public int PostsCount { get; set; }
    public int FriendsCount { get; set; }
    public int PublicPostsCount { get; set; }
    public FriendRequestStatus? FriendStatus { get; set; }
    public bool IsVerified { get; set; }
}

public class UserProfileDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public string? Bio { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TotalPosts { get; set; }
    public int PublicPosts { get; set; }
    public int FriendsOnlyPosts { get; set; }
    public int PrivatePosts { get; set; }
    public int FriendsCount { get; set; }
    public FriendRequestStatus? FriendStatus { get; set; }
}

public class UpdateProfileRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Bio { get; set; }
}
