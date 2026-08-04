using BlogApi.DTOs;

namespace BlogApi.Interfaces.Friends;

public interface IFriendService
{
    Task<FriendRequestResponse> SendFriendRequestAsync(int senderId, int receiverId);
    Task<FriendRequestResponse> AcceptFriendRequestAsync(int requestId, int userId);
    Task<FriendRequestResponse> RejectFriendRequestAsync(int requestId, int userId);
    Task<FriendRequestResponse> CancelFriendRequestAsync(int requestId, int userId);
    Task<FriendRequestResponse> RemoveFriendAsync(int userId, int friendId);
    Task<IEnumerable<FriendRequestDto>> GetIncomingRequestsAsync(int userId);
    Task<IEnumerable<FriendRequestDto>> GetOutgoingRequestsAsync(int userId);
    Task<IEnumerable<UserDto>> GetFriendsAsync(int userId);
    Task<IEnumerable<UserDto>> GetAllUsersAsync(int currentUserId, string? search = null, string? filter = null);
}
