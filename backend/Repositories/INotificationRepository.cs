using BlogApi.Models;

namespace BlogApi.Repositories;

public interface INotificationRepository
{
    Task<Notification?> GetByIdAsync(int id);
    Task<Notification?> GetByIdWithPostAsync(int id);
    Task<IEnumerable<Notification>> GetUserNotificationsAsync(int userId, int pageNumber, int pageSize);
    Task<int> GetTotalCountAsync(int userId);
    Task<int> GetUnreadCountAsync(int userId);
    Task AddAsync(Notification notification);
    Task UpdateAsync(Notification notification);
    Task MarkAllAsReadAsync(int userId);
    Task SaveChangesAsync();
}
