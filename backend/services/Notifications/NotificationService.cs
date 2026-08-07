using BlogApi.DTOs;
using BlogApi.Interfaces.Notifications;
using BlogApi.Models;
using BlogApi.Repositories;

namespace BlogApi.Services.Notifications;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationService(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<PagedResult<NotificationDto>> GetUserNotificationsAsync(int userId, int pageNumber, int pageSize)
    {
        var notifications = await _notificationRepository.GetUserNotificationsAsync(userId, pageNumber, pageSize);
        var totalCount = await _notificationRepository.GetTotalCountAsync(userId);
        
        var notificationDtos = notifications.Select(MapToDto).ToList();
        
        return new PagedResult<NotificationDto>
        {
            Items = notificationDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<UnreadCountResponse> GetUnreadCountAsync(int userId)
    {
        var count = await _notificationRepository.GetUnreadCountAsync(userId);
        return new UnreadCountResponse { Count = count };
    }

    public async Task<MarkAsReadResponse> MarkAsReadAsync(int userId, int notificationId)
    {
        var notification = await _notificationRepository.GetByIdWithPostAsync(notificationId);
        
        if (notification == null)
        {
            return new MarkAsReadResponse { Success = false, Message = "Notification not found." };
        }
        
        // Security: Ensure the notification belongs to the requesting user
        if (notification.RecipientUserId != userId)
        {
            return new MarkAsReadResponse { Success = false, Message = "Unauthorized access to notification." };
        }
        
        notification.IsRead = true;
        await _notificationRepository.UpdateAsync(notification);
        await _notificationRepository.SaveChangesAsync();
        
        return new MarkAsReadResponse { Success = true, Message = "Notification marked as read." };
    }

    public async Task<MarkAsReadResponse> MarkAllAsReadAsync(int userId)
    {
        await _notificationRepository.MarkAllAsReadAsync(userId);
        await _notificationRepository.SaveChangesAsync();
        
        return new MarkAsReadResponse { Success = true, Message = "All notifications marked as read." };
    }

    public async Task CreateNotificationAsync(int recipientUserId, int actorUserId, NotificationType type, string message, int? postId = null, int? commentId = null)
    {
        var notification = new Notification
        {
            RecipientUserId = recipientUserId,
            ActorUserId = actorUserId,
            Type = type,
            Message = message,
            PostId = postId,
            CommentId = commentId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepository.AddAsync(notification);
        await _notificationRepository.SaveChangesAsync();
    }

    private static NotificationDto MapToDto(Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            Type = notification.Type,
            Message = notification.Message,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            Actor = new NotificationActorDto
            {
                Id = notification.ActorUser.Id,
                Name = notification.ActorUser.Name,
                Avatar = notification.ActorUser.Avatar
            },
            PostId = notification.PostId,
            CommentId = notification.CommentId,
            PostTitle = notification.Post?.Title
        };
    }
}
