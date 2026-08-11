using BlogApi.Models;

namespace BlogApi.Repositories;

public interface IChatRepository
{
    Task<Conversation?> GetConversationByParticipantsAsync(int userId1, int userId2);
    Task<Conversation?> GetConversationByIdAsync(int conversationId);
    Task<IEnumerable<Conversation>> GetUserConversationsAsync(int userId);
    Task<IEnumerable<Message>> GetConversationMessagesAsync(int conversationId, int pageNumber, int pageSize);
    Task<int> GetConversationMessageCountAsync(int conversationId);
    Task<int> GetUnreadMessageCountAsync(int conversationId, int userId);
    Task<Message?> GetMessageByIdAsync(int messageId);
    Task<Message?> GetMessageByIdWithConversationAsync(int messageId);
    Task AddConversationAsync(Conversation conversation);
    Task AddConversationParticipantAsync(ConversationParticipant participant);
    Task AddMessageAsync(Message message);
    Task UpdateMessageAsync(Message message);
    Task UpdateConversationAsync(Conversation conversation);
    Task MarkMessagesAsReadAsync(int conversationId, int userId);
    Task SaveChangesAsync();
}
