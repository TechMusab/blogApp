using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Friends;

[ApiController]
[Route("api/friends/requests")]
[EnableCors("ReactApp")]
public class GetOutgoingRequestsController : BaseController
{
    private readonly IGetOutgoingRequestsService _getOutgoingRequestsService;

    public GetOutgoingRequestsController(IGetOutgoingRequestsService getOutgoingRequestsService)
    {
        _getOutgoingRequestsService = getOutgoingRequestsService;
    }

    [Authorize]
    [HttpGet("outgoing")]
    public async Task<ActionResult<IEnumerable<FriendRequestDto>>> GetOutgoingRequests()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var requests = await _getOutgoingRequestsService.GetOutgoingRequestsAsync(userId.Value);
        return Ok(requests);
    }
}
