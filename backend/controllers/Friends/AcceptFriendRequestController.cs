using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Friends;

[ApiController]
[Route("api/friends/request/accept")]
public class AcceptFriendRequestController : BaseController
{
    private readonly IAcceptFriendRequestService _acceptFriendRequestService;

    public AcceptFriendRequestController(IAcceptFriendRequestService acceptFriendRequestService)
    {
        _acceptFriendRequestService = acceptFriendRequestService;
    }

    [Authorize]
    [HttpPost("{id}")]
    public async Task<ActionResult<FriendRequestResponse>> AcceptFriendRequest(int id)
    {
        var userId = GetCurrentUserId();
        
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _acceptFriendRequestService.AcceptFriendRequestAsync(id, userId.Value);
        
        if (result.Message.Contains("not found") || result.Message.Contains("cannot") || result.Message.Contains("only"))
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
