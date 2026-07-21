using BlogApi.DTOs;
using BlogApi.Interfaces.Users;
using BlogApi.Mappers;
using BlogApi.Repositories;

namespace BlogApi.Services.Users;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<AuthUserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user is null ? null : UserMapper.ToAuthUserDto(user);
    }
}
