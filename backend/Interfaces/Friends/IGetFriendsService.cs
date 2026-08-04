using BlogApi.DTOs;

namespace BlogApi.Interfaces.Friends;

public interface IGetFriendsService
{
    Task<IEnumerable<UserDto>> GetFriendsAsync(int userId);
}
