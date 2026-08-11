using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Friends;

[ApiController]
[Route("api/friends/remove")]
public class RemoveFriendController : BaseController
{
    private readonly IRemoveFriendService _removeFriendService;

    public RemoveFriendController(IRemoveFriendService removeFriendService)
    {
        _removeFriendService = removeFriendService;
    }

    [Authorize]
    [HttpDelete("{friendId}")]
    public async Task<ActionResult<FriendRequestResponse>> RemoveFriend(int friendId)
    {
        var userId = GetCurrentUserId();
        
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _removeFriendService.RemoveFriendAsync(userId.Value, friendId);
        
        // RemoveFriend succeeds even if FriendRequest is null (it's deleted)
        // Only return BadRequest if the message indicates an error
        if (result.Message.Contains("not found") || result.Message.Contains("cannot"))
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
