using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using BlogApi.Models;
using BlogApi.Repositories;

namespace BlogApi.Services.Friends;

public class RemoveFriendService : IRemoveFriendService
{
    private readonly IFriendRequestRepository _friendRequestRepository;

    public RemoveFriendService(IFriendRequestRepository friendRequestRepository)
    {
        _friendRequestRepository = friendRequestRepository;
    }

    public async Task<FriendRequestResponse> RemoveFriendAsync(int userId, int friendId)
    {
        // Find accepted request in either direction
        var request = await _friendRequestRepository.GetBySenderAndReceiverAsync(userId, friendId);
        
        if (request == null || request.Status != FriendRequestStatus.Accepted)
        {
            request = await _friendRequestRepository.GetBySenderAndReceiverAsync(friendId, userId);
        }

        if (request == null || request.Status != FriendRequestStatus.Accepted)
        {
            return new FriendRequestResponse { Message = "Friend removed successfully." };
        }

        await _friendRequestRepository.DeleteAsync(request);
        await _friendRequestRepository.SaveChangesAsync();

        return new FriendRequestResponse { Message = "Friend removed successfully." };
    }
}
