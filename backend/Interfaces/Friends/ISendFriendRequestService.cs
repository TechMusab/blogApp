using BlogApi.DTOs;

namespace BlogApi.Interfaces.Friends;

public interface ISendFriendRequestService
{
    Task<FriendRequestResponse> SendFriendRequestAsync(int senderId, int receiverId);
}
