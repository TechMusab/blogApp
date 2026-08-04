using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using BlogApi.Models;
using BlogApi.Repositories;

namespace BlogApi.Services.Friends;

public class GetOutgoingRequestsService : IGetOutgoingRequestsService
{
    private readonly IFriendRequestRepository _friendRequestRepository;

    public GetOutgoingRequestsService(IFriendRequestRepository friendRequestRepository)
    {
        _friendRequestRepository = friendRequestRepository;
    }

    public async Task<IEnumerable<FriendRequestDto>> GetOutgoingRequestsAsync(int userId)
    {
        var requests = await _friendRequestRepository.GetOutgoingRequestsAsync(userId);
        return requests.Select(MapToDto);
    }

    private static FriendRequestDto MapToDto(FriendRequest request)
    {
        return new FriendRequestDto
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
        };
    }
}
