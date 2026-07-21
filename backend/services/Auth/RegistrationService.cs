using BlogApi.Configuration;
using BlogApi.DTOs;
using BlogApi.Factories;
using BlogApi.Interfaces.Auth;
using BlogApi.Interfaces.Core;
using BlogApi.Interfaces.Email;
using BlogApi.Mappers;
using BlogApi.Models;
using BlogApi.Repositories;
using Microsoft.AspNetCore.Identity;

namespace BlogApi.Services.Auth;

public class RegistrationService : IRegistrationService
{
    private readonly IUserRepository _userRepository;
    private readonly IAppConfiguration _appConfiguration;
    private readonly IEmailSender _emailSender;
    private readonly IWebHostEnvironment _environment;
    private readonly IOtpService _otpService;
    private readonly ITokenService _tokenService;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public RegistrationService(
        IUserRepository userRepository,
        IAppConfiguration appConfiguration,
        IEmailSender emailSender,
        IWebHostEnvironment environment,
        IOtpService otpService,
        ITokenService tokenService)
    {
        _userRepository = userRepository;
        _appConfiguration = appConfiguration;
        _emailSender = emailSender;
        _environment = environment;
        _otpService = otpService;
        _tokenService = tokenService;
    }

    public async Task<OtpChallengeResponse> RegisterAsync(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var name = request.Name.Trim();

        var emailExists = await _userRepository.EmailExistsAsync(email);
        if (emailExists)
        {
            throw new InvalidOperationException("An account with this email already exists.");
        }

        var otp = _otpService.GenerateOtp();
        var expiresAt = _otpService.CalculateExpiry(_appConfiguration.OtpLifetimeMinutes);
        var otpHash = _otpService.HashOtp(otp);

        var user = UserFactory.CreateUserForRegistration(
            name,
            email,
            _passwordHasher.HashPassword(new User(), request.Password),
            otpHash.Hash,
            otpHash.Salt,
            expiresAt);

        await _userRepository.AddAsync(user);
        await _emailSender.SendRegistrationOtpAsync(email, name, otp, expiresAt);
        await _userRepository.SaveChangesAsync();

        return new OtpChallengeResponse
        {
            Email = email,
            ExpiresAt = expiresAt,
            Message = "Verification code sent. It expires in 2 minutes.",
            DevelopmentOtp = _environment.IsDevelopment() ? otp : null
        };
    }

    public async Task<AuthResponse> VerifyRegistrationAsync(VerifyRegistrationRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(email);

        if (user is null)
        {
            throw new InvalidOperationException("No registration found for this email.");
        }

        if (user.IsVerified)
        {
            throw new InvalidOperationException("This account is already verified.");
        }

        if (user.IsOtpExpired())
        {
            await _userRepository.DeleteAsync(user);
            await _userRepository.SaveChangesAsync();
            throw new InvalidOperationException("Verification code expired. Please sign up again.");
        }

        if (user.HasExceededOtpAttempts(_appConfiguration.MaxOtpAttempts))
        {
            await _userRepository.DeleteAsync(user);
            await _userRepository.SaveChangesAsync();
            throw new InvalidOperationException("Too many incorrect attempts. Please sign up again.");
        }

        var isValid = _otpService.VerifyOtp(request.Otp, user.OtpSalt, user.OtpHash);
        
        if (!isValid)
        {
            user.IncrementOtpAttempt();
            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();
            throw new InvalidOperationException("Invalid verification code.");
        }

        user.MarkAsVerified();
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        var expiresAt = DateTime.UtcNow.AddHours(8);
        return UserMapper.ToAuthResponse(user, _tokenService.GenerateToken(user, expiresAt), expiresAt);
    }
}
