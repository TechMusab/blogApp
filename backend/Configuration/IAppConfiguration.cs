namespace BlogApi.Configuration;

// Protected Variations: Abstraction layer to protect against configuration changes
public interface IAppConfiguration
{
    string JwtKey { get; }
    string JwtIssuer { get; }
    string JwtAudience { get; }
    int OtpLifetimeMinutes { get; }
    int MaxOtpAttempts { get; }
    string[] CorsAllowedOrigins { get; }
    string EmailProvider { get; }
}
