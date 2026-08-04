using BlogApi.DTOs;
using BlogApi.Interfaces.Users;
using BlogApi.Interfaces.Friends;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Users;

[ApiController]
[Route("api/user")]
[EnableCors("ReactApp")]
public class UserController : BaseController
{
    private readonly IUserService _userService;
    private readonly IFriendService _friendService;
    private readonly IUserProfileService _userProfileService;
    private readonly ILogger<UserController> _logger;

    public UserController(IUserService userService, IFriendService friendService, IUserProfileService userProfileService, ILogger<UserController> logger)
    {
        _userService = userService;
        _friendService = friendService;
        _userProfileService = userProfileService;
        _logger = logger;
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        var userId = GetCurrentUserId();
        _logger.LogInformation("GetProfile called for UserId: {UserId}", userId);

        if (!userId.HasValue)
        {
            _logger.LogWarning("GetProfile failed: No user ID found in token");
            return Unauthorized();
        }

        var user = await _userService.GetUserByIdAsync(userId.Value);
        if (user == null)
        {
            _logger.LogWarning("GetProfile failed: User not found for UserId: {UserId}", userId.Value);
            return NotFound();
        }

        _logger.LogInformation("GetProfile success for UserId: {UserId}, Avatar: {Avatar}", userId.Value, user.Avatar);
        return Ok(user);
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<UserDto>> UpdateProfile(UpdateProfileRequest request)
    {
        var userId = GetCurrentUserId();
        _logger.LogInformation("UpdateProfile called for UserId: {UserId}, Name: {Name}", userId, request.Name);

        if (!userId.HasValue)
        {
            _logger.LogWarning("UpdateProfile failed: No user ID found in token");
            return Unauthorized();
        }

        var user = await _userService.UpdateProfileAsync(userId.Value, request.Name);
        if (user == null)
        {
            _logger.LogWarning("UpdateProfile failed: User not found for UserId: {UserId}", userId.Value);
            return NotFound();
        }

        _logger.LogInformation("UpdateProfile success for UserId: {UserId}, NewName: {Name}", userId.Value, user.Name);
        return Ok(user);
    }

    [Authorize]
    [HttpPost("avatar")]
    public async Task<ActionResult<UserDto>> UpdateAvatar(IFormFile file)
    {
        var userId = GetCurrentUserId();
        _logger.LogInformation("UpdateAvatar called for UserId: {UserId}", userId);

        if (!userId.HasValue)
        {
            _logger.LogWarning("UpdateAvatar failed: No user ID found in token");
            return Unauthorized();
        }

        if (file == null || file.Length == 0)
        {
            _logger.LogWarning("UpdateAvatar failed: No file uploaded. File is null or empty");
            return BadRequest(new { message = "No file uploaded." });
        }

        _logger.LogInformation("File details - Name: {FileName}, Size: {FileSize} bytes, ContentType: {ContentType}",
            file.FileName, file.Length, file.ContentType);

        try
        {
            var user = await _userService.UpdateAvatarAsync(userId.Value, file);
            if (user == null)
            {
                _logger.LogWarning("UpdateAvatar failed: User not found for UserId: {UserId}", userId.Value);
                return NotFound();
            }

            _logger.LogInformation("UpdateAvatar success for UserId: {UserId}, Avatar URL: {Avatar}", userId.Value, user.Avatar);
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "UpdateAvatar failed for UserId: {UserId}", userId);
            return StatusCode(500, new { message = "Failed to upload avatar", error = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers(
        [FromQuery] string? search = null,
        [FromQuery] string? filter = null)
    {
        var userId = GetCurrentUserId();
        
        if (userId is null)
        {
            return Unauthorized();
        }

        var users = await _friendService.GetAllUsersAsync(userId.Value, search, filter);
        return Ok(users);
    }

    [Authorize]
    [HttpGet("profile/{id}")]
    public async Task<ActionResult<UserProfileDto>> GetUserProfile(int id)
    {
        var currentUserId = GetCurrentUserId();
        var profile = await _userProfileService.GetUserProfileAsync(id, currentUserId);
        if (profile == null)
        {
            return NotFound();
        }

        return Ok(profile);
    }
}
