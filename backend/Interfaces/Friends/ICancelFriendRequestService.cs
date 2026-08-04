using BlogApi.DTOs;

namespace BlogApi.Interfaces.Friends;

public interface ICancelFriendRequestService
{
    Task<FriendRequestResponse> CancelFriendRequestAsync(int requestId, int userId);
}
