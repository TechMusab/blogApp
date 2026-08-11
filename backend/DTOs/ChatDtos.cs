namespace BlogApi.DTOs;

public class ConversationDto
{
    public int ConversationId { get; set; }
    public OtherUserDto OtherUser { get; set; } = null!;
    public string? LastMessage { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public int UnreadMessageCount { get; set; }
}

public class OtherUserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Avatar { get; set; }
}

public class CreateConversationRequest
{
    public int UserId { get; set; }
}

public class MessageDto
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? ReadAt { get; set; }
}

public class SendMessageRequest
{
    public string Content { get; set; } = string.Empty;
}

public class PagedMessagesResponse
{
    public List<MessageDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasPrevious { get; set; }
    public bool HasNext { get; set; }
}
