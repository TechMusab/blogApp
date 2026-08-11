using BlogApi.Data;
using BlogApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Repositories;

public class ChatRepository : IChatRepository
{
    private readonly BlogDbContext _context;

    public ChatRepository(BlogDbContext context)
    {
        _context = context;
    }

    public async Task<Conversation?> GetConversationByParticipantsAsync(int userId1, int userId2)
    {
        // Find a conversation that has both users as participants
        var conversations = await _context.ConversationParticipants
            .Where(cp => cp.UserId == userId1)
            .Select(cp => cp.ConversationId)
            .ToListAsync();

        var targetConversation = await _context.ConversationParticipants
            .Where(cp => cp.UserId == userId2 && conversations.Contains(cp.ConversationId))
            .Select(cp => cp.ConversationId)
            .FirstOrDefaultAsync();

        if (targetConversation == 0)
            return null;

        // Verify the conversation has exactly two participants (for 1-to-1 chat)
        var conversation = await _context.Conversations
            .Include(c => c.Participants)
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == targetConversation);

        if (conversation != null && conversation.Participants.Count != 2)
        {
            // This shouldn't happen in normal operation, but guard against malformed data
            return null;
        }

        return conversation;
    }

    public async Task<Conversation?> GetConversationByIdAsync(int conversationId)
    {
        return await _context.Conversations
            .Include(c => c.Participants)
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == conversationId);
    }

    public async Task<IEnumerable<Conversation>> GetUserConversationsAsync(int userId)
    {
        // Ensure we only return conversations where user is actually a participant
        return await _context.ConversationParticipants
            .Where(cp => cp.UserId == userId)
            .Select(cp => cp.Conversation)
            .Include(c => c.Participants)
            .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt))
            .ToListAsync();
    }

    public async Task<IEnumerable<Message>> GetConversationMessagesAsync(int conversationId, int pageNumber, int pageSize)
    {
        return await _context.Messages
            .Where(m => m.ConversationId == conversationId && !m.IsDeleted)
            .OrderByDescending(m => m.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetConversationMessageCountAsync(int conversationId)
    {
        return await _context.Messages
            .Where(m => m.ConversationId == conversationId && !m.IsDeleted)
            .CountAsync();
    }

    public async Task<int> GetUnreadMessageCountAsync(int conversationId, int userId)
    {
        return await _context.Messages
            .Where(m => m.ConversationId == conversationId 
                && m.SenderId != userId 
                && m.ReadAt == null 
                && !m.IsDeleted)
            .CountAsync();
    }

    public async Task<Message?> GetMessageByIdAsync(int messageId)
    {
        return await _context.Messages
            .Include(m => m.Conversation)
            .FirstOrDefaultAsync(m => m.Id == messageId);
    }

    public async Task<Message?> GetMessageByIdWithConversationAsync(int messageId)
    {
        return await _context.Messages
            .Include(m => m.Conversation)
            .ThenInclude(c => c.Participants)
            .FirstOrDefaultAsync(m => m.Id == messageId);
    }

    public async Task AddConversationAsync(Conversation conversation)
    {
        await _context.Conversations.AddAsync(conversation);
    }

    public async Task AddConversationParticipantAsync(ConversationParticipant participant)
    {
        await _context.ConversationParticipants.AddAsync(participant);
    }

    public async Task AddMessageAsync(Message message)
    {
        await _context.Messages.AddAsync(message);
    }

    public async Task UpdateMessageAsync(Message message)
    {
        _context.Messages.Update(message);
    }

    public async Task UpdateConversationAsync(Conversation conversation)
    {
        _context.Conversations.Update(conversation);
    }

    public async Task MarkMessagesAsReadAsync(int conversationId, int userId)
    {
        var unreadMessages = await _context.Messages
            .Where(m => m.ConversationId == conversationId 
                && m.SenderId != userId 
                && m.ReadAt == null 
                && !m.IsDeleted)
            .ToListAsync();

        foreach (var message in unreadMessages)
        {
            message.ReadAt = DateTime.UtcNow;
        }

        _context.Messages.UpdateRange(unreadMessages);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
