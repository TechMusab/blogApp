using BlogApi.Data;
using BlogApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Repositories;

public class FriendRequestRepository : IFriendRequestRepository
{
    private readonly BlogDbContext _context;

    public FriendRequestRepository(BlogDbContext context)
    {
        _context = context;
    }

    public async Task<FriendRequest?> GetByIdAsync(int id)
    {
        return await _context.FriendRequests
            .Include(fr => fr.Sender)
            .Include(fr => fr.Receiver)
            .FirstOrDefaultAsync(fr => fr.Id == id);
    }

    public async Task<FriendRequest?> GetBySenderAndReceiverAsync(int senderId, int receiverId)
    {
        return await _context.FriendRequests
            .Include(fr => fr.Sender)
            .Include(fr => fr.Receiver)
            .FirstOrDefaultAsync(fr => fr.SenderId == senderId && fr.ReceiverId == receiverId);
    }

    public async Task<IEnumerable<FriendRequest>> GetIncomingRequestsAsync(int userId)
    {
        return await _context.FriendRequests
            .Include(fr => fr.Sender)
            .Include(fr => fr.Receiver)
            .Where(fr => fr.ReceiverId == userId && fr.Status == FriendRequestStatus.Pending)
            .OrderByDescending(fr => fr.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<FriendRequest>> GetOutgoingRequestsAsync(int userId)
    {
        return await _context.FriendRequests
            .Include(fr => fr.Sender)
            .Include(fr => fr.Receiver)
            .Where(fr => fr.SenderId == userId && fr.Status == FriendRequestStatus.Pending)
            .OrderByDescending(fr => fr.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<FriendRequest>> GetAcceptedRequestsAsync(int userId)
    {
        return await _context.FriendRequests
            .Include(fr => fr.Sender)
            .Include(fr => fr.Receiver)
            .Where(fr => (fr.SenderId == userId || fr.ReceiverId == userId) && fr.Status == FriendRequestStatus.Accepted)
            .OrderByDescending(fr => fr.UpdatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(FriendRequest friendRequest)
    {
        await _context.FriendRequests.AddAsync(friendRequest);
    }

    public async Task UpdateAsync(FriendRequest friendRequest)
    {
        _context.FriendRequests.Update(friendRequest);
    }

    public async Task DeleteAsync(FriendRequest friendRequest)
    {
        _context.FriendRequests.Remove(friendRequest);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
