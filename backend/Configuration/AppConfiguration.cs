namespace BlogApi.Configuration;

// Protected Variations: Concrete implementation protecting against configuration changes
public class AppConfiguration : IAppConfiguration
{
    private readonly IConfiguration _configuration;

    public AppConfiguration(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string JwtKey => _configuration["Jwt:Key"] 
        ?? throw new InvalidOperationException("Jwt:Key is not configured.");

    public string JwtIssuer => _configuration["Jwt:Issuer"] ?? "FolioApi";

    public string JwtAudience => _configuration["Jwt:Audience"] ?? "FolioClient";

    public int OtpLifetimeMinutes => _configuration.GetValue("RegistrationOtp:LifetimeMinutes", 2);

    public int MaxOtpAttempts => _configuration.GetValue("RegistrationOtp:MaxAttempts", 5);

    public string[] CorsAllowedOrigins => _configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>()
        ?? new[] { "http://localhost:5173", "https://localhost:5173" };

    public string EmailProvider => _configuration["Email:Provider"] ?? "Smtp";
}
