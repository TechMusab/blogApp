namespace BlogApi.Models;

public class Message
{
    public int Id { get; set; }

    public int ConversationId { get; set; }

    public int SenderId { get; set; }

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public bool IsDeleted { get; set; } = false;

    public DateTime? ReadAt { get; set; }

    // Navigation Properties
    public Conversation Conversation { get; set; } = null!;

    public User Sender { get; set; } = null!;
}
