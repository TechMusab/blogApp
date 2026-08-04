using BlogApi.DTOs;

namespace BlogApi.Interfaces.Friends;

public interface IAcceptFriendRequestService
{
    Task<FriendRequestResponse> AcceptFriendRequestAsync(int requestId, int userId);
}
