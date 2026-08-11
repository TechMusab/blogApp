using BlogApi.DTOs;

namespace BlogApi.Interfaces.Chat;

public interface IChatService
{
    Task<IEnumerable<ConversationDto>> GetConversationsAsync(int currentUserId);
    Task<ConversationDto> GetOrCreateConversationAsync(int currentUserId, int targetUserId);
    Task<PagedMessagesResponse> GetConversationMessagesAsync(int currentUserId, int conversationId, int pageNumber, int pageSize);
    Task<MessageDto> SendMessageAsync(int currentUserId, int conversationId, string content);
    Task MarkMessagesAsReadAsync(int currentUserId, int conversationId);
    Task<(int conversationId, int messageId)> DeleteMessageAsync(int currentUserId, int messageId);
}
