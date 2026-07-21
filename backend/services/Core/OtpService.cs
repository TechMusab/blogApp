using System.Security.Cryptography;
using BlogApi.Interfaces.Core;

namespace BlogApi.Services.Core;

public class OtpService : IOtpService
{
    public string GenerateOtp()
    {
        return RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
    }

    public (string Hash, string Salt) HashOtp(string otp)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            otp,
            salt,
            100_000,
            HashAlgorithmName.SHA256,
            32);

        return (Convert.ToBase64String(hash), Convert.ToBase64String(salt));
    }

    public bool VerifyOtp(string otp, string salt, string expectedHash)
    {
        var saltBytes = Convert.FromBase64String(salt);
        var expectedHashBytes = Convert.FromBase64String(expectedHash);
        var actualHashBytes = Rfc2898DeriveBytes.Pbkdf2(
            otp,
            saltBytes,
            100_000,
            HashAlgorithmName.SHA256,
            32);

        return CryptographicOperations.FixedTimeEquals(actualHashBytes, expectedHashBytes);
    }

    public DateTime CalculateExpiry(int lifetimeMinutes)
    {
        return DateTime.UtcNow.AddMinutes(lifetimeMinutes);
    }
}
