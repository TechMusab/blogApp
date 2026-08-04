using System.ComponentModel.DataAnnotations;
using BlogApi.Models;

namespace BlogApi.DTOs;

public class FriendRequestDto
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public int ReceiverId { get; set; }
    public FriendRequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string SenderAvatar { get; set; } = string.Empty;
    public string ReceiverName { get; set; } = string.Empty;
    public string ReceiverEmail { get; set; } = string.Empty;
    public string ReceiverAvatar { get; set; } = string.Empty;
}

public class SendFriendRequestRequest
{
    [Required]
    public int ReceiverId { get; set; }
}

public class FriendRequestResponse
{
    public string Message { get; set; } = string.Empty;
    public FriendRequestDto? FriendRequest { get; set; }
}
