using System.Net;
using System.Net.Mail;
using BlogApi.Helpers;
using BlogApi.Interfaces.Email;

namespace BlogApi.Services.Email;

public class SmtpEmailSender : IEmailSender
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public SmtpEmailSender(
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        _configuration = configuration;
        _environment = environment;
    }

    public async Task SendRegistrationOtpAsync(string email, string name, string otp, DateTime expiresAt)
    {
        var host = _configuration["Email:Smtp:Host"];

        // Check for invalid or example host
        if (string.IsNullOrWhiteSpace(host) || host == "smtp.example.com")
        {
            if (_environment.IsDevelopment())
            {
                return;
            }

            throw new InvalidOperationException("Email:Smtp:Host must be configured before registration OTPs can be sent.");
        }

        var port = _configuration.GetValue("Email:Smtp:Port", 587);
        var enableSsl = _configuration.GetValue("Email:Smtp:EnableSsl", true);
        var username = _configuration["Email:Smtp:Username"];
        var password = _configuration["Email:Smtp:Password"];
        var from = _configuration.GetRequiredConfigurationValue("Email:Smtp:From", "Email:Smtp:From must be configured.");

        try
        {
            using var message = new MailMessage(from, email)
            {
                Subject = "Your Blog App verification code",
                Body = $"Hi {name},\n\nYour verification code is {otp}. It expires at {expiresAt:u}.\n\nIf you did not request this, you can ignore this email.",
                IsBodyHtml = false
            };

            using var client = new SmtpClient(host, port)
            {
                EnableSsl = enableSsl
            };

            if (!string.IsNullOrWhiteSpace(username))
            {
                client.Credentials = new NetworkCredential(username, password);
            }

            await client.SendMailAsync(message);
        }
        catch (Exception ex)
        {
            if (_environment.IsDevelopment())
            {
                return;
            }

            throw;
        }
    }
}
