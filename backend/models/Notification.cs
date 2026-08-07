namespace BlogApi.Models;

public class Notification
{
    public int Id { get; set; }

    public int RecipientUserId { get; set; }

    public int ActorUserId { get; set; }

    public NotificationType Type { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? PostId { get; set; }

    public int? CommentId { get; set; }

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public User RecipientUser { get; set; } = null!;

    public User ActorUser { get; set; } = null!;

    public Post? Post { get; set; }

    public Comment? Comment { get; set; }
}
