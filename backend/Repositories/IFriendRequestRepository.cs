using BlogApi.Models;

namespace BlogApi.Repositories;

public interface IFriendRequestRepository
{
    Task<FriendRequest?> GetByIdAsync(int id);
    Task<FriendRequest?> GetBySenderAndReceiverAsync(int senderId, int receiverId);
    Task<IEnumerable<FriendRequest>> GetIncomingRequestsAsync(int userId);
    Task<IEnumerable<FriendRequest>> GetOutgoingRequestsAsync(int userId);
    Task<IEnumerable<FriendRequest>> GetAcceptedRequestsAsync(int userId);
    Task AddAsync(FriendRequest friendRequest);
    Task UpdateAsync(FriendRequest friendRequest);
    Task DeleteAsync(FriendRequest friendRequest);
    Task SaveChangesAsync();
}
