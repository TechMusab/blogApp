using BlogApi.DTOs;
using BlogApi.Interfaces.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BlogApi.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatService _chatService;
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(IChatService chatService, ILogger<ChatHub> logger)
    {
        _chatService = chatService;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Unable to identify user from JWT token.");
        }
        return userId;
    }

    private async Task<bool> IsUserParticipantAsync(int userId, int conversationId)
    {
        try
        {
            // This will throw if user is not a participant
            await _chatService.GetConversationMessagesAsync(userId, conversationId, 1, 1);
            return true;
        }
        catch (UnauthorizedAccessException)
        {
            return false;
        }
        catch (InvalidOperationException)
        {
            // Conversation not found
            return false;
        }
        catch (Exception)
        {
            // Any other error means not a participant
            return false;
        }
    }

    public async Task JoinConversation(int conversationId)
    {
        var userId = GetCurrentUserId();

        if (!await IsUserParticipantAsync(userId, conversationId))
        {
            throw new UnauthorizedAccessException("You are not a participant in this conversation.");
        }

        var groupName = $"conversation-{conversationId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    public async Task LeaveConversation(int conversationId)
    {
        var userId = GetCurrentUserId();

        var groupName = $"conversation-{conversationId}";
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }

    public async Task SendMessage(int conversationId, string content)
    {
        var userId = GetCurrentUserId();

        if (!await IsUserParticipantAsync(userId, conversationId))
        {
            throw new UnauthorizedAccessException("You are not a participant in this conversation.");
        }

        try
        {
            var messageDto = await _chatService.SendMessageAsync(userId, conversationId, content);
            
            var groupName = $"conversation-{conversationId}";
            await Clients.Group(groupName).SendAsync("ReceiveMessage", messageDto);
        }
        catch (ArgumentException ex)
        {
            throw new HubException(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            throw new HubException(ex.Message);
        }
    }

    public async Task MarkAsRead(int conversationId)
    {
        var userId = GetCurrentUserId();

        if (!await IsUserParticipantAsync(userId, conversationId))
        {
            throw new UnauthorizedAccessException("You are not a participant in this conversation.");
        }

        try
        {
            await _chatService.MarkMessagesAsReadAsync(userId, conversationId);
            
            var groupName = $"conversation-{conversationId}";
            await Clients.Group(groupName).SendAsync("MessageRead", conversationId, userId);
        }
        catch (InvalidOperationException ex)
        {
            throw new HubException(ex.Message);
        }
    }

    public async Task TypingStart(int conversationId)
    {
        var userId = GetCurrentUserId();

        if (!await IsUserParticipantAsync(userId, conversationId))
        {
            throw new UnauthorizedAccessException("You are not a participant in this conversation.");
        }

        var groupName = $"conversation-{conversationId}";
        await Clients.OthersInGroup(groupName).SendAsync("UserTyping", conversationId, userId);
    }

    public async Task TypingStop(int conversationId)
    {
        var userId = GetCurrentUserId();

        if (!await IsUserParticipantAsync(userId, conversationId))
        {
            throw new UnauthorizedAccessException("You are not a participant in this conversation.");
        }

        var groupName = $"conversation-{conversationId}";
        await Clients.OthersInGroup(groupName).SendAsync("UserStoppedTyping", conversationId, userId);
    }

    public async Task DeleteMessage(int messageId)
    {
        var userId = GetCurrentUserId();

        try
        {
            var (conversationId, deletedMessageId) = await _chatService.DeleteMessageAsync(userId, messageId);
            
            var groupName = $"conversation-{conversationId}";
            await Clients.Group(groupName).SendAsync("MessageDeleted", deletedMessageId);
        }
        catch (InvalidOperationException ex)
        {
            throw new HubException(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            throw new HubException(ex.Message);
        }
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetCurrentUserId();
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetCurrentUserId();
        await base.OnDisconnectedAsync(exception);
    }
}
