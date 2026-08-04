using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Friends;

[ApiController]
[Route("api/friends/request")]
[EnableCors("ReactApp")]
public class SendFriendRequestController : BaseController
{
    private readonly ISendFriendRequestService _sendFriendRequestService;

    public SendFriendRequestController(ISendFriendRequestService sendFriendRequestService)
    {
        _sendFriendRequestService = sendFriendRequestService;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<FriendRequestResponse>> SendFriendRequest(SendFriendRequestRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _sendFriendRequestService.SendFriendRequestAsync(userId.Value, request.ReceiverId);
        if (result.Message.Contains("not found") || result.Message.Contains("Cannot") || result.Message.Contains("already"))
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
