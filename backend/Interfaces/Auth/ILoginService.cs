using BlogApi.DTOs;

namespace BlogApi.Interfaces.Auth;

public interface ILoginService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
}
