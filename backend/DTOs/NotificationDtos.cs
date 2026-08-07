using BlogApi.Models;

namespace BlogApi.DTOs;

public class NotificationDto
{
    public int Id { get; set; }
    public NotificationType Type { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public NotificationActorDto Actor { get; set; } = null!;
    public int? PostId { get; set; }
    public int? CommentId { get; set; }
    public string? PostTitle { get; set; }
}

public class NotificationActorDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Avatar { get; set; }
}

public class UnreadCountResponse
{
    public int Count { get; set; }
}

public class MarkAsReadResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}
