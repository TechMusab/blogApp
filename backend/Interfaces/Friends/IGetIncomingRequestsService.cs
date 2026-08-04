using BlogApi.DTOs;

namespace BlogApi.Interfaces.Friends;

public interface IGetIncomingRequestsService
{
    Task<IEnumerable<FriendRequestDto>> GetIncomingRequestsAsync(int userId);
}
