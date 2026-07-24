using BlogApi.DTOs;
using BlogApi.Models;

namespace BlogApi.Mappers;

public static class UserMapper
{
    // Pure Fabrication: Separate class for mapping/conversion logic
    public static AuthUserDto ToAuthUserDto(User user)
    {
        return new AuthUserDto
        {
            Id = user.Id.ToString(),
            Name = user.Name,
            Email = user.Email,
            Avatar = user.Avatar,
            Bio = "New member of Folio Journal."
        };
    }

    public static AuthResponse ToAuthResponse(User user, string token, DateTime expiresAt)
    {
        return new AuthResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = ToAuthUserDto(user)
        };
    }
}
