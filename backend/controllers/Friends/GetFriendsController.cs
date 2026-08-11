using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Friends;

[ApiController]
[Route("api/friends")]
public class GetFriendsController : BaseController
{
    private readonly IGetFriendsService _getFriendsService;

    public GetFriendsController(IGetFriendsService getFriendsService)
    {
        _getFriendsService = getFriendsService;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetFriends()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var friends = await _getFriendsService.GetFriendsAsync(userId.Value);
        return Ok(friends);
    }
}
