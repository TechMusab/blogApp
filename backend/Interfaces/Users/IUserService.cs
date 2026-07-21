using BlogApi.DTOs;

namespace BlogApi.Interfaces.Users;

public interface IUserService
{
    Task<AuthUserDto?> GetUserByIdAsync(int userId);
}
