using BlogApi.Models;
using Microsoft.AspNetCore.Identity;

namespace BlogApi.Factories;

public static class UserFactory
{
    public static User CreateUserForRegistration(string name, string email, string passwordHash, string otpHash, string otpSalt, DateTime otpExpiresAt)
    {
        return new User
        {
            Name = name,
            Email = email,
            PasswordHash = passwordHash,
            IsVerified = false,
            OtpHash = otpHash,
            OtpSalt = otpSalt,
            OtpExpiresAt = otpExpiresAt,
            OtpAttemptCount = 0
        };
    }

    public static User CreateVerifiedUser(string name, string email, string passwordHash)
    {
        return new User
        {
            Name = name,
            Email = email,
            PasswordHash = passwordHash,
            IsVerified = true,
            OtpHash = string.Empty,
            OtpSalt = string.Empty,
            OtpExpiresAt = DateTime.MinValue,
            OtpAttemptCount = 0
        };
    }
}
