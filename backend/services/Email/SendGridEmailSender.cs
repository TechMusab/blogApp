using BlogApi.Helpers;
using BlogApi.Interfaces.Email;

namespace BlogApi.Services.Email;

public class SendGridEmailSender : IEmailSender
{
    private readonly string _apiKey;
    private readonly string _fromEmail;

    public SendGridEmailSender(IConfiguration configuration)
    {
        _apiKey = configuration.GetRequiredConfigurationValue("SendGrid:ApiKey");
        _fromEmail = configuration.GetRequiredConfigurationValue("SendGrid:FromEmail");
    }

    public async Task SendRegistrationOtpAsync(string email, string name, string otp, DateTime expiresAt)
    {
        // SendGrid implementation would go here
        // This is a placeholder to demonstrate Polymorphism pattern
        await Task.CompletedTask;

        // In real implementation:
        // var client = new SendGridClient(_apiKey);
        // var message = new SendGridMessage
        // {
        //     From = new EmailAddress(_fromEmail),
        //     Subject = "Verify your Folio account",
        //     PlainTextContent = $"Your verification code is: {otp}"
        // };
        // message.AddTo(new EmailAddress(email, name));
        // await client.SendEmailAsync(message);
    }
}
