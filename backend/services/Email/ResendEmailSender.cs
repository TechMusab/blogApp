using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Resend;
using BlogApi.Interfaces.Email;
using BlogApi.Configuration;

namespace BlogApi.Services.Email;

public class ResendEmailSender : IEmailSender
{
    private readonly IResend _resendClient;
    private readonly ResendOptions _options;
    private readonly ILogger<ResendEmailSender> _logger;

    public ResendEmailSender(
        IOptions<ResendOptions> options,
        ILogger<ResendEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new InvalidOperationException("Resend:ApiKey must be configured in appsettings.json or environment variables.");
        }

        _resendClient = ResendClient.Create(_options.ApiKey);
    }

    public async Task SendRegistrationOtpAsync(string email, string name, string otp, DateTime expiresAt)
    {
        try
        {
            var fromEmail = string.IsNullOrWhiteSpace(_options.FromEmail) 
                ? "onboarding@resend.dev" 
                : _options.FromEmail;
            
            var fromName = string.IsNullOrWhiteSpace(_options.FromName) 
                ? "Blog App" 
                : _options.FromName;

            var subject = "Your Blog App verification code";
            var body = $"Hi {name},\n\nYour verification code is {otp}. It expires at {expiresAt:u}.\n\nIf you did not request this, you can ignore this email.";

            _logger.LogInformation("Sending registration OTP email to {Email} via Resend", email);

            var message = new EmailMessage
            {
                From = fromEmail,
                To = new[] { email },
                Subject = subject,
                HtmlBody = body.Replace("\n", "<br/>")
            };

            var result = await _resendClient.EmailSendAsync(message);

            if (result == null)
            {
                _logger.LogError("Failed to send email to {Email}: Resend returned null response", email);
                throw new InvalidOperationException("Failed to send email: Resend returned null response");
            }

            _logger.LogInformation("Successfully sent registration OTP email to {Email}. Result: {Result}", email, result.ToString());
        }
        catch (ResendException ex)
        {
            _logger.LogError(ex, "Resend API error when sending email to {Email}: {Message}", email, ex.Message);
            throw new InvalidOperationException($"Failed to send email via Resend: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when sending email to {Email}: {Message}", email, ex.Message);
            throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
        }
    }
}
