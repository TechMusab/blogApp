using BlogApi.DTOs;

namespace BlogApi.Interfaces.Users;

public interface IUserProfileService
{
    Task<UserProfileDto?> GetUserProfileAsync(int userId, int? currentUserId = null);
}
