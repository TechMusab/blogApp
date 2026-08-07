using BlogApi.DTOs;
using BlogApi.Models;

namespace BlogApi.Interfaces.Notifications;

public interface INotificationService
{
    Task<PagedResult<NotificationDto>> GetUserNotificationsAsync(int userId, int pageNumber, int pageSize);
    Task<UnreadCountResponse> GetUnreadCountAsync(int userId);
    Task<MarkAsReadResponse> MarkAsReadAsync(int userId, int notificationId);
    Task<MarkAsReadResponse> MarkAllAsReadAsync(int userId);
    Task CreateNotificationAsync(int recipientUserId, int actorUserId, NotificationType type, string message, int? postId = null, int? commentId = null);
}
