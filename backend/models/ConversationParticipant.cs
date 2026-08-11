namespace BlogApi.Models;

public class ConversationParticipant
{
    public int ConversationId { get; set; }

    public int UserId { get; set; }

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public Conversation Conversation { get; set; } = null!;

    public User User { get; set; } = null!;
}
