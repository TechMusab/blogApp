using BlogApi.Configuration;
using BlogApi.DTOs;
using BlogApi.Interfaces.Auth;
using BlogApi.Interfaces.Core;
using BlogApi.Interfaces.Users;
using BlogApi.Mappers;
using BlogApi.Models;
using BlogApi.Repositories;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;

namespace BlogApi.Services.Auth;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly IAppConfiguration _appConfiguration;

    public GoogleAuthService(
        IUserRepository userRepository,
        ITokenService tokenService,
        IAppConfiguration appConfiguration)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _appConfiguration = appConfiguration;
    }

    public async Task<AuthResponse> AuthenticateWithGoogleAsync(GoogleAuthRequest request)
    {
        // Validate the Google ID token
        var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { _appConfiguration.GoogleClientId }
        });

        // Check if user already exists with this Google account
        var existingUser = await _userRepository.GetByProviderAsync("Google", payload.Subject);
        
        if (existingUser != null)
        {
            // User exists, generate token and return
            var expiry1 = DateTime.UtcNow.AddHours(8);
            return UserMapper.ToAuthResponse(existingUser, _tokenService.GenerateToken(existingUser, expiry1), expiry1);
        }

        // Check if user exists with the same email
        var userByEmail = await _userRepository.GetByEmailAsync(payload.Email);
        
        if (userByEmail != null)
        {
            // User exists with this email but not via Google
            // Link the Google account to the existing user
            userByEmail.Provider = "Google";
            userByEmail.ProviderId = payload.Subject;
            userByEmail.IsVerified = true; // Google accounts are verified
            await _userRepository.UpdateAsync(userByEmail);
            
            var expiry2 = DateTime.UtcNow.AddHours(8);
            return UserMapper.ToAuthResponse(userByEmail, _tokenService.GenerateToken(userByEmail, expiry2), expiry2);
        }

        // Create new user from Google account
        var newUser = new User
        {
            Name = payload.Name,
            Email = payload.Email,
            PasswordHash = null, // No password for OAuth users
            IsVerified = true, // Google accounts are verified
            Provider = "Google",
            ProviderId = payload.Subject,
            Avatar = payload.Picture,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(newUser);
        await _userRepository.SaveChangesAsync();
        
        var expiry3 = DateTime.UtcNow.AddHours(8);
        return UserMapper.ToAuthResponse(newUser, _tokenService.GenerateToken(newUser, expiry3), expiry3);
    }
}
