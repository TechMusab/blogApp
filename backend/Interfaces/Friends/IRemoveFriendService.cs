using BlogApi.DTOs;

namespace BlogApi.Interfaces.Friends;

public interface IRemoveFriendService
{
    Task<FriendRequestResponse> RemoveFriendAsync(int userId, int friendId);
}
