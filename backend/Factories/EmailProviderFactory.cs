using BlogApi.Configuration;
using BlogApi.Interfaces.Auth;
using BlogApi.Interfaces.Email;
using BlogApi.Services.Email;
using Microsoft.Extensions.DependencyInjection;

namespace BlogApi.Factories;

public static class EmailProviderFactory
{
    public static IEmailSender CreateEmailSender(
        IAppConfiguration configuration,
        IConfiguration rootConfiguration,
        IWebHostEnvironment environment,
        IServiceProvider serviceProvider)
    {
        return configuration.EmailProvider.ToLowerInvariant() switch
        {
            "resend" => serviceProvider.GetRequiredService<ResendEmailSender>(),
            _ => throw new InvalidOperationException($"Unsupported email provider: {configuration.EmailProvider}. Only 'Resend' is supported.")
        };
    }
}
