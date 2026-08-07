using BlogApi.Data;
using BlogApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly BlogDbContext _context;

    public NotificationRepository(BlogDbContext context)
    {
        _context = context;
    }

    public async Task<Notification?> GetByIdAsync(int id)
    {
        return await _context.Notifications
            .Include(n => n.ActorUser)
            .Include(n => n.RecipientUser)
            .Include(n => n.Post)
            .Include(n => n.Comment)
            .FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task<Notification?> GetByIdWithPostAsync(int id)
    {
        return await _context.Notifications
            .Include(n => n.ActorUser)
            .Include(n => n.RecipientUser)
            .Include(n => n.Post)
            .Include(n => n.Comment)
            .FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(int userId, int pageNumber, int pageSize)
    {
        return await _context.Notifications
            .Include(n => n.ActorUser)
            .Include(n => n.Post)
            .Include(n => n.Comment)
            .Where(n => n.RecipientUserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetTotalCountAsync(int userId)
    {
        return await _context.Notifications
            .Where(n => n.RecipientUserId == userId)
            .CountAsync();
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _context.Notifications
            .Where(n => n.RecipientUserId == userId && !n.IsRead)
            .CountAsync();
    }

    public async Task AddAsync(Notification notification)
    {
        await _context.Notifications.AddAsync(notification);
    }

    public async Task UpdateAsync(Notification notification)
    {
        _context.Notifications.Update(notification);
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var unreadNotifications = await _context.Notifications
            .Where(n => n.RecipientUserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
        }

        _context.Notifications.UpdateRange(unreadNotifications);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
