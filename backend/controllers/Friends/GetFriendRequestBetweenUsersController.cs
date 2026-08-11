using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using BlogApi.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Friends;

[ApiController]
[Route("api/friends/request/between")]
public class GetFriendRequestBetweenUsersController : BaseController
{
    private readonly IFriendRequestRepository _friendRequestRepository;

    public GetFriendRequestBetweenUsersController(IFriendRequestRepository friendRequestRepository)
    {
        _friendRequestRepository = friendRequestRepository;
    }

    [Authorize]
    [HttpGet("{targetUserId}")]
    public async Task<ActionResult<FriendRequestDto>> GetFriendRequestBetweenUsers(int targetUserId)
    {
        var currentUserId = GetCurrentUserId();
        
        if (currentUserId is null)
        {
            return Unauthorized();
        }

        var request = await _friendRequestRepository.GetBySenderAndReceiverAsync(currentUserId.Value, targetUserId)
            ?? await _friendRequestRepository.GetBySenderAndReceiverAsync(targetUserId, currentUserId.Value);

        if (request == null)
        {
            return NotFound();
        }

        return Ok(new FriendRequestDto
        {
            Id = request.Id,
            SenderId = request.SenderId,
            ReceiverId = request.ReceiverId,
            Status = request.Status,
            CreatedAt = request.CreatedAt,
            UpdatedAt = request.UpdatedAt,
            SenderName = request.Sender?.Name ?? "",
            SenderEmail = request.Sender?.Email ?? "",
            SenderAvatar = request.Sender?.Avatar ?? "",
            ReceiverName = request.Receiver?.Name ?? "",
            ReceiverEmail = request.Receiver?.Email ?? "",
            ReceiverAvatar = request.Receiver?.Avatar ?? ""
        });
    }
}
