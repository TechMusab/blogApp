using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Friends;

[ApiController]
[Route("api/friends/request/reject")]
public class RejectFriendRequestController : BaseController
{
    private readonly IRejectFriendRequestService _rejectFriendRequestService;

    public RejectFriendRequestController(IRejectFriendRequestService rejectFriendRequestService)
    {
        _rejectFriendRequestService = rejectFriendRequestService;
    }

    [Authorize]
    [HttpPost("{id}")]
    public async Task<ActionResult<FriendRequestResponse>> RejectFriendRequest(int id)
    {
        var userId = GetCurrentUserId();
        
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _rejectFriendRequestService.RejectFriendRequestAsync(id, userId.Value);
        
        if (result.Message.Contains("not found") || result.Message.Contains("cannot") || result.Message.Contains("only"))
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
