using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Friends;

[ApiController]
[Route("api/friends/request/cancel")]
public class CancelFriendRequestController : BaseController
{
    private readonly ICancelFriendRequestService _cancelFriendRequestService;

    public CancelFriendRequestController(ICancelFriendRequestService cancelFriendRequestService)
    {
        _cancelFriendRequestService = cancelFriendRequestService;
    }

    [Authorize]
    [HttpPost("{id}")]
    public async Task<ActionResult<FriendRequestResponse>> CancelFriendRequest(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _cancelFriendRequestService.CancelFriendRequestAsync(id, userId.Value);
        if (result.Message.Contains("not found") || result.Message.Contains("Cannot") || result.Message.Contains("only"))
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
