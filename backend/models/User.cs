namespace BlogApi.Models;

public class User
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;
    
    public bool IsVerified { get; set; } = false;

    public string OtpHash { get; set; } = string.Empty;

    public string OtpSalt { get; set; } = string.Empty;

    public DateTime OtpExpiresAt { get; set; } = DateTime.UtcNow;

    public int OtpAttemptCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public ICollection<Post> Posts { get; set; } = new List<Post>();

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public ICollection<PostLike> LikedPosts { get; set; } = new List<PostLike>();

    public ICollection<SavedPost> SavedPosts { get; set; } = new List<SavedPost>();
}
