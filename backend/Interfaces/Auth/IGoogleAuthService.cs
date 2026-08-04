using BlogApi.DTOs;

namespace BlogApi.Interfaces.Auth;

public interface IGoogleAuthService
{
    Task<AuthResponse> AuthenticateWithGoogleAsync(GoogleAuthRequest request);
}
