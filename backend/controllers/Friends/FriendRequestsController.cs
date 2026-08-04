using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Friends;

[ApiController]
[Route("api/friends/requests")]
[EnableCors("ReactApp")]
public class GetIncomingRequestsController : BaseController
{
    private readonly IGetIncomingRequestsService _getIncomingRequestsService;

    public GetIncomingRequestsController(IGetIncomingRequestsService getIncomingRequestsService)
    {
        _getIncomingRequestsService = getIncomingRequestsService;
    }

    [Authorize]
    [HttpGet("incoming")]
    public async Task<ActionResult<IEnumerable<FriendRequestDto>>> GetIncomingRequests()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var requests = await _getIncomingRequestsService.GetIncomingRequestsAsync(userId.Value);
        return Ok(requests);
    }
}
