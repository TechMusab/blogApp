using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Friends;

[ApiController]
[Route("api/friends")]
[EnableCors("ReactApp")]
public class FriendsController : BaseController
{
    private readonly IFriendService _friendService;

    public FriendsController(IFriendService friendService)
    {
        _friendService = friendService;
    }

    [Authorize]
    [HttpPost("request")]
    public async Task<ActionResult<FriendRequestResponse>> SendFriendRequest(SendFriendRequestRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _friendService.SendFriendRequestAsync(userId.Value, request.ReceiverId);
        if (!string.IsNullOrEmpty(result.Message) && result.FriendRequest == null)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [Authorize]
    [HttpPost("accept/{id}")]
    public async Task<ActionResult<FriendRequestResponse>> AcceptFriendRequest(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _friendService.AcceptFriendRequestAsync(id, userId.Value);
        if (!string.IsNullOrEmpty(result.Message) && result.FriendRequest == null)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [Authorize]
    [HttpPost("reject/{id}")]
    public async Task<ActionResult<FriendRequestResponse>> RejectFriendRequest(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _friendService.RejectFriendRequestAsync(id, userId.Value);
        if (!string.IsNullOrEmpty(result.Message) && result.FriendRequest == null)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [Authorize]
    [HttpPost("cancel/{id}")]
    public async Task<ActionResult<FriendRequestResponse>> CancelFriendRequest(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _friendService.CancelFriendRequestAsync(id, userId.Value);
        if (!string.IsNullOrEmpty(result.Message) && result.FriendRequest == null)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [Authorize]
    [HttpDelete("remove/{friendId}")]
    public async Task<ActionResult<FriendRequestResponse>> RemoveFriend(int friendId)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _friendService.RemoveFriendAsync(userId.Value, friendId);
        if (!string.IsNullOrEmpty(result.Message) && result.FriendRequest == null)
        {
            return BadRequest(result);
        }

        return Ok(result);
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

        var friends = await _friendService.GetFriendsAsync(userId.Value);
        return Ok(friends);
    }

    [Authorize]
    [HttpGet("requests/incoming")]
    public async Task<ActionResult<IEnumerable<FriendRequestDto>>> GetIncomingRequests()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var requests = await _friendService.GetIncomingRequestsAsync(userId.Value);
        return Ok(requests);
    }

    [Authorize]
    [HttpGet("requests/outgoing")]
    public async Task<ActionResult<IEnumerable<FriendRequestDto>>> GetOutgoingRequests()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var requests = await _friendService.GetOutgoingRequestsAsync(userId.Value);
        return Ok(requests);
    }
}
