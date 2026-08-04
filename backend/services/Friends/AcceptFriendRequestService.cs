using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using BlogApi.Models;
using BlogApi.Repositories;

namespace BlogApi.Services.Friends;

public class AcceptFriendRequestService : IAcceptFriendRequestService
{
    private readonly IFriendRequestRepository _friendRequestRepository;

    public AcceptFriendRequestService(IFriendRequestRepository friendRequestRepository)
    {
        _friendRequestRepository = friendRequestRepository;
    }

    public async Task<FriendRequestResponse> AcceptFriendRequestAsync(int requestId, int userId)
    {
        var request = await _friendRequestRepository.GetByIdAsync(requestId);
        
        if (request == null)
        {
            return new FriendRequestResponse { Message = "Friend request not found." };
        }

        if (request.ReceiverId != userId)
        {
            return new FriendRequestResponse { Message = "You can only accept requests sent to you." };
        }

        if (request.Status != FriendRequestStatus.Pending)
        {
            return new FriendRequestResponse { Message = "Request is no longer pending." };
        }

        request.Status = FriendRequestStatus.Accepted;
        request.UpdatedAt = DateTime.UtcNow;

        // Ensure CreatedAt is UTC if it's not already
        if (request.CreatedAt.Kind == DateTimeKind.Unspecified)
        {
            request.CreatedAt = DateTime.SpecifyKind(request.CreatedAt, DateTimeKind.Utc);
        }

        await _friendRequestRepository.UpdateAsync(request);
        await _friendRequestRepository.SaveChangesAsync();

        var updatedRequest = await _friendRequestRepository.GetByIdAsync(requestId);
        return new FriendRequestResponse
        {
            Message = "Friend request accepted.",
            FriendRequest = MapToDto(updatedRequest!)
        };
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
