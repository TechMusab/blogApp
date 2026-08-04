namespace BlogApi.Models;

public class FriendRequest
{
    public int Id { get; set; }

    public int SenderId { get; set; }

    public int ReceiverId { get; set; }

    public FriendRequestStatus Status { get; set; } = FriendRequestStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation Properties
    public User Sender { get; set; } = null!;
    public User Receiver { get; set; } = null!;
}
