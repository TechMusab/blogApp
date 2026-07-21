using BlogApi.DTOs;

namespace BlogApi.Interfaces.Auth;

public interface IRegistrationService
{
    Task<OtpChallengeResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> VerifyRegistrationAsync(VerifyRegistrationRequest request);
}
