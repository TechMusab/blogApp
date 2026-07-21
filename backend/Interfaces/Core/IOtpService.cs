namespace BlogApi.Interfaces.Core;

public interface IOtpService
{
    string GenerateOtp();
    (string Hash, string Salt) HashOtp(string otp);
    bool VerifyOtp(string otp, string salt, string expectedHash);
    DateTime CalculateExpiry(int lifetimeMinutes);
}
