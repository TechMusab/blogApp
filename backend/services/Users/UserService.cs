using BlogApi.DTOs;
using BlogApi.Interfaces.Storage;
using BlogApi.Interfaces.Users;
using BlogApi.Mappers;
using BlogApi.Repositories;

namespace BlogApi.Services.Users;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IImageStorage _imageStorage;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository userRepository, IImageStorage imageStorage, ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _imageStorage = imageStorage;
        _logger = logger;
    }

    public async Task<AuthUserDto?> GetUserByIdAsync(int userId)
    {
        _logger.LogInformation("GetUserByIdAsync called for UserId: {UserId}", userId);
        var user = await _userRepository.GetByIdAsync(userId);
        return user is null ? null : UserMapper.ToAuthUserDto(user);
    }

    public async Task<UserDto?> UpdateProfileAsync(int userId, string name)
    {
        _logger.LogInformation("UpdateProfileAsync called for UserId: {UserId}, Name: {Name}", userId, name);
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("UpdateProfileAsync failed: User not found for UserId: {UserId}", userId);
            return null;
        }

        user.Name = name;
        // Don't modify avatar field - preserve existing avatar
        await _userRepository.UpdateAsync(user);

        _logger.LogInformation("UpdateProfileAsync success for UserId: {UserId}, Avatar preserved: {Avatar}", userId, user.Avatar);
        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Avatar = user.Avatar,
            IsVerified = user.IsVerified,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserDto?> UpdateAvatarAsync(int userId, IFormFile avatarFile)
    {
        _logger.LogInformation("=== USER SERVICE AVATAR UPLOAD START ===");
        _logger.LogInformation("UserId: {UserId}", userId);
        _logger.LogInformation("File: {FileName}, Size: {FileSize} bytes", avatarFile.FileName, avatarFile.Length);
        
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("UpdateAvatarAsync failed: User not found for UserId: {UserId}", userId);
            return null;
        }

        try
        {
            _logger.LogInformation("Starting image upload to storage...");
            var imageUrl = await _imageStorage.UploadAsync(avatarFile, "avatars");
            _logger.LogInformation("Image uploaded to storage, relative path: {ImageUrl}", imageUrl);
            
            var fullUrl = _imageStorage.GetUrl(imageUrl);
            _logger.LogInformation("Full URL constructed: {FullUrl}", fullUrl);

            user.Avatar = fullUrl;
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("=== USER SERVICE AVATAR UPLOAD SUCCESS ===");
            _logger.LogInformation("UserId: {UserId}, Avatar: {Avatar}", userId, user.Avatar);
            
            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Avatar = user.Avatar,
                IsVerified = user.IsVerified,
                CreatedAt = user.CreatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "=== USER SERVICE AVATAR UPLOAD ERROR ===");
            _logger.LogError("Error message: {Message}", ex.Message);
            _logger.LogError("Stack trace: {StackTrace}", ex.StackTrace);
            throw;
        }
    }
}
