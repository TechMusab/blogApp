using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using BlogApi.Interfaces.Notifications;
using BlogApi.Models;
using BlogApi.Repositories;

namespace BlogApi.Services.Friends;

public class AcceptFriendRequestService : IAcceptFriendRequestService
{
    private readonly IFriendRequestRepository _friendRequestRepository;
    private readonly INotificationService _notificationService;

    public AcceptFriendRequestService(
        IFriendRequestRepository friendRequestRepository,
        INotificationService notificationService)
    {
        _friendRequestRepository = friendRequestRepository;
        _notificationService = notificationService;
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

        // Create notification for the sender (original requester)
        var message = $"{request.Receiver?.Name ?? "Someone"} accepted your friend request.";
        await _notificationService.CreateNotificationAsync(
            recipientUserId: request.SenderId,
            actorUserId: request.ReceiverId,
            type: NotificationType.FriendRequestAccepted,
            message: message
        );

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
