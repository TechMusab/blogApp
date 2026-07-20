using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using BlogApi.Data;
using BlogApi.DTOs;
using BlogApi.Models;
using BlogApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BlogApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly BlogDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailSender _emailSender;
    private readonly IWebHostEnvironment _environment;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public AuthController(
        BlogDbContext context,
        IConfiguration configuration,
        IEmailSender emailSender,
        IWebHostEnvironment environment)
    {
        _context = context;
        _configuration = configuration;
        _emailSender = emailSender;
        _environment = environment;
    }

    [HttpPost("register")]
    public async Task<ActionResult<OtpChallengeResponse>> Register(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var name = request.Name.Trim();

        var emailExists = await _context.Users.AnyAsync(user => user.Email == email);
        if (emailExists)
        {
            return Conflict(new { message = "An account with this email already exists." });
        }

        var otp = GenerateOtp();
        var otpLifetimeMinutes = _configuration.GetValue("RegistrationOtp:LifetimeMinutes", 2);
        var expiresAt = DateTime.UtcNow.AddMinutes(otpLifetimeMinutes);
        var otpHash = HashOtp(otp);

        var user = new User
        {
            Name = name,
            Email = email,
            PasswordHash = _passwordHasher.HashPassword(new User(), request.Password),
            IsVerified = false,
            OtpHash = otpHash.Hash,
            OtpSalt = otpHash.Salt,
            OtpExpiresAt = expiresAt,
            OtpAttemptCount = 0
        };

        _context.Users.Add(user);

        await _emailSender.SendRegistrationOtpAsync(email, name, otp, expiresAt);
        await _context.SaveChangesAsync();

        return Ok(new OtpChallengeResponse
        {
            Email = email,
            ExpiresAt = expiresAt,
            Message = "Verification code sent. It expires in 2 minutes.",
            DevelopmentOtp = _environment.IsDevelopment() ? otp : null
        });
    }

    [HttpPost("verify-registration")]
    public async Task<ActionResult<AuthResponse>> VerifyRegistration(VerifyRegistrationRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.SingleOrDefaultAsync(entry => entry.Email == email);

        if (user is null)
        {
            return NotFound(new { message = "No registration found for this email." });
        }

        if (user.IsVerified)
        {
            return BadRequest(new { message = "This account is already verified." });
        }

        if (user.OtpExpiresAt <= DateTime.UtcNow)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return BadRequest(new { message = "Verification code expired. Please sign up again." });
        }

        var maxAttempts = _configuration.GetValue("RegistrationOtp:MaxAttempts", 5);
        if (user.OtpAttemptCount >= maxAttempts)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return BadRequest(new { message = "Too many incorrect attempts. Please sign up again." });
        }

        if (!VerifyOtp(request.Otp, user.OtpSalt, user.OtpHash))
        {
            user.OtpAttemptCount++;
            await _context.SaveChangesAsync();
            return BadRequest(new { message = "Invalid verification code." });
        }

        user.IsVerified = true;
        user.OtpHash = string.Empty;
        user.OtpSalt = string.Empty;
        user.OtpExpiresAt = DateTime.MinValue;
        user.OtpAttemptCount = 0;

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Me), BuildAuthResponse(user));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.SingleOrDefaultAsync(entry => entry.Email == email);

        if (user is null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        if (!user.IsVerified)
        {
            return Unauthorized(new { message = "Please verify your email before logging in." });
        }

        var passwordResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (passwordResult == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        return Ok(BuildAuthResponse(user));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<AuthUserDto>> Me()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        return user is null ? NotFound() : Ok(ToAuthUserDto(user));
    }

    private AuthResponse BuildAuthResponse(User user)
    {
        var expiresAt = DateTime.UtcNow.AddHours(8);

        return new AuthResponse
        {
            Token = GenerateToken(user, expiresAt),
            ExpiresAt = expiresAt,
            User = ToAuthUserDto(user)
        };
    }

    private string GenerateToken(User user, DateTime expiresAt)
    {
        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key is not configured.");
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static AuthUserDto ToAuthUserDto(User user)
    {
        return new AuthUserDto
        {
            Id = user.Id.ToString(),
            Name = user.Name,
            Email = user.Email,
            Avatar = BuildAvatar(user.Name),
            Bio = "New member of Folio Journal."
        };
    }

    private static string BuildAvatar(string name)
    {
        var parts = name
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Take(2)
            .Select(part => part[0].ToString().ToUpperInvariant());

        var avatar = string.Concat(parts);
        return string.IsNullOrWhiteSpace(avatar) ? "U" : avatar;
    }

    private static string GenerateOtp()
    {
        return RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
    }

    private static (string Hash, string Salt) HashOtp(string otp)
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

    private static bool VerifyOtp(string otp, string salt, string expectedHash)
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
}
