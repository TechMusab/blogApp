namespace BlogApi.Models;

public class PendingRegistration
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string OtpHash { get; set; } = string.Empty;

    public string OtpSalt { get; set; } = string.Empty;

    public int AttemptCount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAt { get; set; }
}
