using BlogApi.DTOs;

namespace BlogApi.Interfaces.Friends;

public interface IRejectFriendRequestService
{
    Task<FriendRequestResponse> RejectFriendRequestAsync(int requestId, int userId);
}
