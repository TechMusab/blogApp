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

    public string? Avatar { get; set; }

    // Information Expert: Domain logic behavior
    public bool CanVerifyOtp() => !IsVerified && OtpExpiresAt > DateTime.UtcNow && OtpAttemptCount < 5;

    public bool IsOtpExpired() => OtpExpiresAt <= DateTime.UtcNow;

    public bool HasExceededOtpAttempts(int maxAttempts = 5) => OtpAttemptCount >= maxAttempts;

    public void IncrementOtpAttempt()
    {
        OtpAttemptCount++;
    }

    public void MarkAsVerified()
    {
        IsVerified = true;
        OtpHash = string.Empty;
        OtpSalt = string.Empty;
        OtpExpiresAt = DateTime.MinValue;
        OtpAttemptCount = 0;
    }

    public string GenerateAvatar()
    {
        var parts = Name
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Take(2)
            .Select(part => part[0].ToString().ToUpperInvariant());

        var avatar = string.Concat(parts);
        return string.IsNullOrWhiteSpace(avatar) ? "U" : avatar;
    }

    // Navigation Properties
    public ICollection<Post> Posts { get; set; } = new List<Post>();

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public ICollection<PostLike> LikedPosts { get; set; } = new List<PostLike>();

    public ICollection<SavedPost> SavedPosts { get; set; } = new List<SavedPost>();
}
