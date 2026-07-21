using BlogApi.Configuration;
using BlogApi.Interfaces.Auth;
using BlogApi.Interfaces.Email;
using BlogApi.Services.Email;

namespace BlogApi.Factories;

public static class EmailProviderFactory
{
    public static IEmailSender CreateEmailSender(
        IAppConfiguration configuration, 
        IConfiguration rootConfiguration,
        IWebHostEnvironment environment)
    {
        return configuration.EmailProvider.ToLowerInvariant() switch
        {
            "smtp" => new SmtpEmailSender(rootConfiguration, environment),
            "sendgrid" => new SendGridEmailSender(rootConfiguration),
            _ => throw new InvalidOperationException($"Unsupported email provider: {configuration.EmailProvider}")
        };
    }
}
