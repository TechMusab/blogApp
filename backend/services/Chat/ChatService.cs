using BlogApi.DTOs;
using BlogApi.Interfaces.Chat;
using BlogApi.Models;
using BlogApi.Repositories;

namespace BlogApi.Services.Chat;

public class ChatService : IChatService
{
    private readonly IChatRepository _chatRepository;
    private readonly IUserRepository _userRepository;
    private readonly IFriendRequestRepository _friendRequestRepository;

    public ChatService(
        IChatRepository chatRepository,
        IUserRepository userRepository,
        IFriendRequestRepository friendRequestRepository)
    {
        _chatRepository = chatRepository;
        _userRepository = userRepository;
        _friendRequestRepository = friendRequestRepository;
    }

    public async Task<IEnumerable<ConversationDto>> GetConversationsAsync(int currentUserId)
    {
        var conversations = await _chatRepository.GetUserConversationsAsync(currentUserId);
        var conversationDtos = new List<ConversationDto>();

        foreach (var conversation in conversations)
        {
            var otherParticipant = conversation.Participants.FirstOrDefault(p => p.UserId != currentUserId);
            if (otherParticipant == null) continue;

            var otherUser = await _userRepository.GetByIdAsync(otherParticipant.UserId);
            if (otherUser == null) continue;

            var lastMessage = conversation.Messages.FirstOrDefault();
            var unreadCount = await _chatRepository.GetUnreadMessageCountAsync(conversation.Id, currentUserId);

            conversationDtos.Add(new ConversationDto
            {
                ConversationId = conversation.Id,
                OtherUser = new OtherUserDto
                {
                    Id = otherUser.Id,
                    Name = otherUser.Name,
                    Avatar = otherUser.Avatar
                },
                LastMessage = lastMessage?.Content,
                LastMessageAt = lastMessage?.CreatedAt,
                UnreadMessageCount = unreadCount
            });
        }

        return conversationDtos.OrderByDescending(c => c.LastMessageAt ?? DateTime.MinValue);
    }

    public async Task<ConversationDto> GetOrCreateConversationAsync(int currentUserId, int targetUserId)
    {
        // Prevent chatting with yourself
        if (currentUserId == targetUserId)
        {
            throw new InvalidOperationException("You cannot create a conversation with yourself.");
        }

        // Check if target user exists
        var targetUser = await _userRepository.GetByIdAsync(targetUserId);
        if (targetUser == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        // Check if users are friends (only accepted friendships)
        var friendRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(currentUserId, targetUserId)
            ?? await _friendRequestRepository.GetBySenderAndReceiverAsync(targetUserId, currentUserId);

        if (friendRequest == null)
        {
            throw new InvalidOperationException("No friend relationship exists with this user.");
        }

        if (friendRequest.Status != FriendRequestStatus.Accepted)
        {
            var statusMessage = friendRequest.Status switch
            {
                FriendRequestStatus.Pending => "Friend request is still pending.",
                FriendRequestStatus.Rejected => "Friend request was rejected.",
                FriendRequestStatus.Cancelled => "Friend request was cancelled.",
                _ => "You can only chat with accepted friends."
            };
            throw new InvalidOperationException(statusMessage);
        }

        // Check if conversation already exists
        var existingConversation = await _chatRepository.GetConversationByParticipantsAsync(currentUserId, targetUserId);
        if (existingConversation != null)
        {
            var otherParticipant = existingConversation.Participants.FirstOrDefault(p => p.UserId != currentUserId);
            var otherUser = await _userRepository.GetByIdAsync(otherParticipant!.UserId);
            var lastMessage = existingConversation.Messages.FirstOrDefault();
            var unreadCount = await _chatRepository.GetUnreadMessageCountAsync(existingConversation.Id, currentUserId);

            return new ConversationDto
            {
                ConversationId = existingConversation.Id,
                OtherUser = new OtherUserDto
                {
                    Id = otherUser!.Id,
                    Name = otherUser.Name,
                    Avatar = otherUser.Avatar
                },
                LastMessage = lastMessage?.Content,
                LastMessageAt = lastMessage?.CreatedAt,
                UnreadMessageCount = unreadCount
            };
        }

        // Create new conversation
        var conversation = new Conversation
        {
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _chatRepository.AddConversationAsync(conversation);
        await _chatRepository.SaveChangesAsync();

        // Add both participants
        await _chatRepository.AddConversationParticipantAsync(new ConversationParticipant
        {
            ConversationId = conversation.Id,
            UserId = currentUserId,
            JoinedAt = DateTime.UtcNow
        });

        await _chatRepository.AddConversationParticipantAsync(new ConversationParticipant
        {
            ConversationId = conversation.Id,
            UserId = targetUserId,
            JoinedAt = DateTime.UtcNow
        });

        await _chatRepository.SaveChangesAsync();

        return new ConversationDto
        {
            ConversationId = conversation.Id,
            OtherUser = new OtherUserDto
            {
                Id = targetUser.Id,
                Name = targetUser.Name,
                Avatar = targetUser.Avatar
            },
            LastMessage = null,
            LastMessageAt = null,
            UnreadMessageCount = 0
        };
    }

    public async Task<PagedMessagesResponse> GetConversationMessagesAsync(int currentUserId, int conversationId, int pageNumber, int pageSize)
    {
        var conversation = await _chatRepository.GetConversationByIdAsync(conversationId);
        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found.");
        }

        // Check if user is a participant
        var isParticipant = conversation.Participants.Any(p => p.UserId == currentUserId);
        if (!isParticipant)
        {
            throw new UnauthorizedAccessException("You are not a participant in this conversation.");
        }

        // Validate conversation has exactly 2 participants (1-to-1 chat)
        if (conversation.Participants.Count != 2)
        {
            throw new InvalidOperationException("Invalid conversation structure.");
        }

        var messages = await _chatRepository.GetConversationMessagesAsync(conversationId, pageNumber, pageSize);
        var totalCount = await _chatRepository.GetConversationMessageCountAsync(conversationId);
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        var messageDtos = messages.Select(m => new MessageDto
        {
            Id = m.Id,
            SenderId = m.SenderId,
            Content = m.Content,
            CreatedAt = m.CreatedAt,
            UpdatedAt = m.UpdatedAt,
            IsDeleted = m.IsDeleted,
            ReadAt = m.ReadAt
        }).ToList();

        return new PagedMessagesResponse
        {
            Items = messageDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalPages = totalPages,
            HasPrevious = pageNumber > 1,
            HasNext = pageNumber < totalPages
        };
    }

    public async Task<MessageDto> SendMessageAsync(int currentUserId, int conversationId, string content)
    {
        var conversation = await _chatRepository.GetConversationByIdAsync(conversationId);
        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found.");
        }

        // Check if user is a participant
        var isParticipant = conversation.Participants.Any(p => p.UserId == currentUserId);
        if (!isParticipant)
        {
            throw new UnauthorizedAccessException("You are not a participant in this conversation.");
        }

        // Validate conversation has exactly 2 participants (1-to-1 chat)
        if (conversation.Participants.Count != 2)
        {
            throw new InvalidOperationException("Invalid conversation structure.");
        }

        // Validate content
        if (string.IsNullOrWhiteSpace(content))
        {
            throw new ArgumentException("Message content cannot be empty.");
        }

        var trimmedContent = content.Trim();
        if (trimmedContent.Length > 2000)
        {
            throw new ArgumentException("Message content cannot exceed 2000 characters.");
        }

        var message = new Message
        {
            ConversationId = conversationId,
            SenderId = currentUserId,
            Content = trimmedContent,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsDeleted = false,
            ReadAt = null
        };

        await _chatRepository.AddMessageAsync(message);
        
        // Update conversation timestamp
        conversation.UpdatedAt = DateTime.UtcNow;
        await _chatRepository.UpdateConversationAsync(conversation);
        
        await _chatRepository.SaveChangesAsync();

        return new MessageDto
        {
            Id = message.Id,
            SenderId = message.SenderId,
            Content = message.Content,
            CreatedAt = message.CreatedAt,
            UpdatedAt = message.UpdatedAt,
            IsDeleted = message.IsDeleted,
            ReadAt = message.ReadAt
        };
    }

    public async Task MarkMessagesAsReadAsync(int currentUserId, int conversationId)
    {
        var conversation = await _chatRepository.GetConversationByIdAsync(conversationId);
        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found.");
        }

        // Check if user is a participant
        var isParticipant = conversation.Participants.Any(p => p.UserId == currentUserId);
        if (!isParticipant)
        {
            throw new UnauthorizedAccessException("You are not a participant in this conversation.");
        }

        // Validate conversation has exactly 2 participants (1-to-1 chat)
        if (conversation.Participants.Count != 2)
        {
            throw new InvalidOperationException("Invalid conversation structure.");
        }

        await _chatRepository.MarkMessagesAsReadAsync(conversationId, currentUserId);
        await _chatRepository.SaveChangesAsync();
    }

    public async Task<(int conversationId, int messageId)> DeleteMessageAsync(int currentUserId, int messageId)
    {
        var message = await _chatRepository.GetMessageByIdWithConversationAsync(messageId);
        if (message == null)
        {
            throw new InvalidOperationException("Message not found.");
        }

        // Only sender can delete their own message
        if (message.SenderId != currentUserId)
        {
            throw new UnauthorizedAccessException("You can only delete your own messages.");
        }

        // Verify user is still a participant in the conversation
        var isParticipant = message.Conversation.Participants.Any(p => p.UserId == currentUserId);
        if (!isParticipant)
        {
            throw new UnauthorizedAccessException("You are not a participant in this conversation.");
        }

        var conversationId = message.ConversationId;

        // Soft delete
        message.IsDeleted = true;
        message.UpdatedAt = DateTime.UtcNow;

        await _chatRepository.UpdateMessageAsync(message);
        await _chatRepository.SaveChangesAsync();

        return (conversationId, messageId);
    }
}
