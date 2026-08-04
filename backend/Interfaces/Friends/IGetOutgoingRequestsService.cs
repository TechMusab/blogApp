using BlogApi.DTOs;

namespace BlogApi.Interfaces.Friends;

public interface IGetOutgoingRequestsService
{
    Task<IEnumerable<FriendRequestDto>> GetOutgoingRequestsAsync(int userId);
}
