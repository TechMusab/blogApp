using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using BlogApi.Models;
using BlogApi.Repositories;
using Npgsql;

namespace BlogApi.Services.Friends;

public class FriendService : IFriendService
{
    private readonly IFriendRequestRepository _friendRequestRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPostRepository _postRepository;

    public FriendService(
        IFriendRequestRepository friendRequestRepository,
        IUserRepository userRepository,
        IPostRepository postRepository)
    {
        _friendRequestRepository = friendRequestRepository;
        _userRepository = userRepository;
        _postRepository = postRepository;
    }

    public async Task<FriendRequestResponse> SendFriendRequestAsync(int senderId, int receiverId)
    {
        // Cannot send request to self
        if (senderId == receiverId)
        {
            return new FriendRequestResponse { Message = "Cannot send friend request to yourself." };
        }

        // Check if receiver exists
        var receiver = await _userRepository.GetByIdAsync(receiverId);
        if (receiver == null)
        {
            return new FriendRequestResponse { Message = "User not found." };
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
            // Unique constraint violation - request already exists
            return new FriendRequestResponse { Message = "Friend request already exists." };
        }

        var createdRequest = await _friendRequestRepository.GetByIdAsync(friendRequest.Id);
        return new FriendRequestResponse
        {
            Message = "Friend request sent successfully.",
            FriendRequest = MapToDto(createdRequest!)
        };
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

    public async Task<FriendRequestResponse> RejectFriendRequestAsync(int requestId, int userId)
    {
        var request = await _friendRequestRepository.GetByIdAsync(requestId);
        
        if (request == null)
        {
            return new FriendRequestResponse { Message = "Friend request not found." };
        }

        if (request.ReceiverId != userId)
        {
            return new FriendRequestResponse { Message = "You can only reject requests sent to you." };
        }

        if (request.Status != FriendRequestStatus.Pending)
        {
            return new FriendRequestResponse { Message = "Request is no longer pending." };
        }

        request.Status = FriendRequestStatus.Rejected;
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
            Message = "Friend request rejected.",
            FriendRequest = MapToDto(updatedRequest!)
        };
    }

    public async Task<FriendRequestResponse> CancelFriendRequestAsync(int requestId, int userId)
    {
        var request = await _friendRequestRepository.GetByIdAsync(requestId);
        if (request == null)
        {
            return new FriendRequestResponse { Message = "Friend request not found." };
        }

        if (request.SenderId != userId)
        {
            return new FriendRequestResponse { Message = "You can only cancel requests you sent." };
        }

        if (request.Status != FriendRequestStatus.Pending)
        {
            return new FriendRequestResponse { Message = "Can only cancel pending requests." };
        }

        request.Status = FriendRequestStatus.Cancelled;
        request.UpdatedAt = DateTime.UtcNow;

        // Ensure CreatedAt is UTC if it's not already
        if (request.CreatedAt.Kind == DateTimeKind.Unspecified)
        {
            request.CreatedAt = DateTime.SpecifyKind(request.CreatedAt, DateTimeKind.Utc);
        }

        await _friendRequestRepository.UpdateAsync(request);
        await _friendRequestRepository.SaveChangesAsync();

        return new FriendRequestResponse { Message = "Friend request cancelled." };
    }

    public async Task<FriendRequestResponse> RemoveFriendAsync(int userId, int friendId)
    {
        // Find accepted request in either direction
        var request = await _friendRequestRepository.GetBySenderAndReceiverAsync(userId, friendId);
        
        if (request == null || request.Status != FriendRequestStatus.Accepted)
        {
            request = await _friendRequestRepository.GetBySenderAndReceiverAsync(friendId, userId);
        }

        if (request == null || request.Status != FriendRequestStatus.Accepted)
        {
            return new FriendRequestResponse { Message = "Friend removed successfully." };
        }

        await _friendRequestRepository.DeleteAsync(request);
        await _friendRequestRepository.SaveChangesAsync();

        return new FriendRequestResponse { Message = "Friend removed successfully." };
    }

    public async Task<IEnumerable<FriendRequestDto>> GetIncomingRequestsAsync(int userId)
    {
        var requests = await _friendRequestRepository.GetIncomingRequestsAsync(userId);
        return requests.Select(MapToDto);
    }

    public async Task<IEnumerable<FriendRequestDto>> GetOutgoingRequestsAsync(int userId)
    {
        var requests = await _friendRequestRepository.GetOutgoingRequestsAsync(userId);
        return requests.Select(MapToDto);
    }

    public async Task<IEnumerable<UserDto>> GetFriendsAsync(int userId)
    {
        var acceptedRequests = await _friendRequestRepository.GetAcceptedRequestsAsync(userId);
        
        var friendIds = acceptedRequests
            .Where(fr => fr.SenderId == userId)
            .Select(fr => fr.ReceiverId)
            .Concat(acceptedRequests.Where(fr => fr.ReceiverId == userId).Select(fr => fr.SenderId))
            .Distinct();

        var friends = new List<UserDto>();
        foreach (var friendId in friendIds)
        {
            var user = await _userRepository.GetByIdAsync(friendId);
            if (user != null)
            {
                var posts = await _postRepository.GetByAuthorIdAsync(friendId);
                var publicPosts = posts.Count(p => p.Visibility == BlogVisibility.Public);
                var userFriends = await _friendRequestRepository.GetAcceptedRequestsAsync(friendId);
                friends.Add(new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Avatar = user.Avatar,
                    CreatedAt = user.CreatedAt,
                    PostsCount = posts.Count(),
                    FriendsCount = userFriends.Count(),
                    PublicPostsCount = publicPosts,
                    FriendStatus = FriendRequestStatus.Accepted
                });
            }
        }
        return friends;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync(int currentUserId, string? search = null, string? filter = null)
    {
        var allUsers = await _userRepository.GetAllAsync();
        var users = allUsers.Where(u => u.Id != currentUserId).ToList();


        // Apply search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            users = users.Where(u =>
                u.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                u.Email.Contains(search, StringComparison.OrdinalIgnoreCase)
            ).ToList();

        }

        var result = new List<UserDto>();
        foreach (var user in users)
        {
            try
            {

                var posts = await _postRepository.GetByAuthorIdAsync(user.Id);
                
                var friendRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(currentUserId, user.Id);
                var reverseRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(user.Id, currentUserId);



                FriendRequestStatus? friendStatus = null;
                string? friendRequestDirection = null;
                
                // Prioritize reverse request (incoming) over direct request (outgoing)
                if (reverseRequest != null)
                {
                    friendStatus = reverseRequest.Status;
                    friendRequestDirection = "received";

                }
                else if (friendRequest != null)
                {
                    friendStatus = friendRequest.Status;
                    friendRequestDirection = "sent";

                }
                else
                {

                }

                // Apply filter
                if (!string.IsNullOrWhiteSpace(filter))
                {

                    if (filter == "friends" && friendStatus != FriendRequestStatus.Accepted)
                    {

                        continue;
                    }
                    if (filter == "not_friends" && friendStatus == FriendRequestStatus.Accepted)
                    {

                        continue;
                    }
                    if (filter == "pending" && friendStatus != FriendRequestStatus.Pending)
                    {

                        continue;
                    }

                }

                var publicPosts = posts.Count(p => p.Visibility == BlogVisibility.Public);
                var userFriends = await _friendRequestRepository.GetAcceptedRequestsAsync(user.Id);

                result.Add(new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Avatar = user.Avatar,
                    CreatedAt = user.CreatedAt,
                    PostsCount = posts.Count(),
                    FriendsCount = userFriends.Count(),
                    PublicPostsCount = publicPosts,
                    FriendStatus = friendStatus,
                    FriendRequestDirection = friendRequestDirection
                });
            }
            catch
            {
                // Log error but continue with other users
                // Add user with default values if post query fails
                var friendRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(currentUserId, user.Id);
                var reverseRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(user.Id, currentUserId);

                FriendRequestStatus? friendStatus = null;
                string? friendRequestDirection = null;
                
                // Prioritize reverse request (incoming) over direct request (outgoing)
                if (reverseRequest != null)
                {
                    friendStatus = reverseRequest.Status;
                    friendRequestDirection = "received";
                }
                else if (friendRequest != null)
                {
                    friendStatus = friendRequest.Status;
                    friendRequestDirection = "sent";
                }

                // Apply filter
                if (!string.IsNullOrWhiteSpace(filter))
                {
                    if (filter == "friends" && friendStatus != FriendRequestStatus.Accepted)
                        continue;
                    if (filter == "not_friends" && friendStatus == FriendRequestStatus.Accepted)
                        continue;
                    if (filter == "pending" && friendStatus != FriendRequestStatus.Pending)
                        continue;
                }

                var userFriends = await _friendRequestRepository.GetAcceptedRequestsAsync(user.Id);
                result.Add(new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Avatar = user.Avatar,
                    CreatedAt = user.CreatedAt,
                    PostsCount = 0,
                    FriendsCount = userFriends.Count(),
                    PublicPostsCount = 0,
                    FriendStatus = friendStatus,
                    FriendRequestDirection = friendRequestDirection
                });
            }
        }


        return result;
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
            SenderName = request.Sender.Name,
            SenderEmail = request.Sender.Email,
            SenderAvatar = request.Sender.Avatar ?? BuildAvatar(request.Sender.Name),
            ReceiverName = request.Receiver.Name,
            ReceiverEmail = request.Receiver.Email,
            ReceiverAvatar = request.Receiver.Avatar ?? BuildAvatar(request.Receiver.Name)
        };
    }

    private static string BuildAvatar(string name)
    {
        var avatar = string.Concat(name
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Take(2)
            .Select(part => part[0].ToString().ToUpperInvariant()));

        return string.IsNullOrWhiteSpace(avatar) ? "U" : avatar;
    }
}
