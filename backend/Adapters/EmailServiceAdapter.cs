using BlogApi.Interfaces.Email;
using BlogApi.Services;

namespace BlogApi.Adapters;

// Indirection: Adapter pattern to provide unified interface
public class EmailServiceAdapter
{
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;

    public EmailServiceAdapter(IEmailSender emailSender, IConfiguration configuration)
    {
        _emailSender = emailSender;
        _configuration = configuration;
    }

    public async Task SendOtpEmailAsync(string email, string name, string otp, DateTime expiresAt)
    {
        // Adapter provides additional indirection layer
        // Can add logging, retry logic, or other cross-cutting concerns here
        await _emailSender.SendRegistrationOtpAsync(email, name, otp, expiresAt);
    }

    public async Task SendWelcomeEmailAsync(string email, string name)
    {
        // Adapter can extend functionality beyond the original interface
        // This provides indirection between the service and the actual implementation
        await Task.CompletedTask;
        // Implementation would call _emailSender with welcome email template
    }
}
