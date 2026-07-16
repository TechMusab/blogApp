namespace BlogApi.Services;

public interface IEmailSender
{
    Task SendRegistrationOtpAsync(string email, string name, string otp, DateTime expiresAt);
}
