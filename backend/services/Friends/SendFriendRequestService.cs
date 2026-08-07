using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using BlogApi.Interfaces.Notifications;
using BlogApi.Models;
using BlogApi.Repositories;
using Npgsql;

namespace BlogApi.Services.Friends;

public class SendFriendRequestService : ISendFriendRequestService
{
    private readonly IFriendRequestRepository _friendRequestRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationService _notificationService;

    public SendFriendRequestService(
        IFriendRequestRepository friendRequestRepository,
        IUserRepository userRepository,
        INotificationService notificationService)
    {
        _friendRequestRepository = friendRequestRepository;
        _userRepository = userRepository;
        _notificationService = notificationService;
    }

    public async Task<FriendRequestResponse> SendFriendRequestAsync(int senderId, int receiverId)
    {
        var sender = await _userRepository.GetByIdAsync(senderId);
        var receiver = await _userRepository.GetByIdAsync(receiverId);

        if (sender == null || receiver == null)
        {
            return new FriendRequestResponse { Message = "User not found." };
        }

        if (senderId == receiverId)
        {
            return new FriendRequestResponse { Message = "Cannot send friend request to yourself." };
        }

        // Check if request already exists
        var existingRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(senderId, receiverId);
        if (existingRequest != null)
        {
            if (existingRequest.Status == FriendRequestStatus.Pending)
            {
                return new FriendRequestResponse { Message = "Friend request already pending." };
            }
            if (existingRequest.Status == FriendRequestStatus.Accepted)
            {
                return new FriendRequestResponse { Message = "You are already friends." };
            }
            if (existingRequest.Status == FriendRequestStatus.Rejected)
            {
                return new FriendRequestResponse { Message = "Cannot send request after rejection." };
            }
        }

        // Check if already friends (accepted request from other direction)
        var reverseRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(receiverId, senderId);
        if (reverseRequest != null && reverseRequest.Status == FriendRequestStatus.Accepted)
        {
            return new FriendRequestResponse { Message = "You are already friends." };
        }

        var friendRequest = new FriendRequest
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Status = FriendRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        try
        {
            await _friendRequestRepository.AddAsync(friendRequest);
            await _friendRequestRepository.SaveChangesAsync();
        }
        catch (Npgsql.PostgresException ex) when (ex.SqlState == "23505")
        {
            return new FriendRequestResponse { Message = "Friend request already exists." };
        }

        // Create notification for the receiver
        var message = $"{sender.Name} sent you a friend request.";
        await _notificationService.CreateNotificationAsync(
            recipientUserId: receiverId,
            actorUserId: senderId,
            type: NotificationType.FriendRequest,
            message: message
        );

        return new FriendRequestResponse
        {
            Message = "Friend request sent successfully.",
            FriendRequest = MapToDto(friendRequest)
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
