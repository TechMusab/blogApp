using BlogApi.Configuration;
using BlogApi.DTOs;
using BlogApi.Interfaces.Auth;
using BlogApi.Interfaces.Core;
using BlogApi.Interfaces.Email;
using BlogApi.Mappers;
using BlogApi.Models;
using BlogApi.Repositories;
using Microsoft.AspNetCore.Identity;

namespace BlogApi.Services.Auth;

public class LoginService : ILoginService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public LoginService(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(email);

        if (user is null)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!user.IsVerified)
        {
            throw new UnauthorizedAccessException("Please verify your email before logging in.");
        }

        var passwordResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (passwordResult == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var expiresAt = DateTime.UtcNow.AddHours(8);
        return UserMapper.ToAuthResponse(user, _tokenService.GenerateToken(user, expiresAt), expiresAt);
    }
}
