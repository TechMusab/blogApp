using BlogApi.DTOs;

namespace BlogApi.Interfaces.Users;

public interface IUserService
{
    Task<AuthUserDto?> GetUserByIdAsync(int userId);
    Task<UserDto?> UpdateProfileAsync(int userId, string name);
    Task<UserDto?> UpdateAvatarAsync(int userId, IFormFile avatarFile);
}
