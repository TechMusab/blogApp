using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using BlogApi.Models;
using BlogApi.Repositories;

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
            CreatedAt = DateTime.UtcNow
        };

        await _friendRequestRepository.AddAsync(friendRequest);
        await _friendRequestRepository.SaveChangesAsync();

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
            return new FriendRequestResponse { Message = "Friendship not found." };
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
                friends.Add(new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Avatar = user.Avatar,
                    CreatedAt = user.CreatedAt,
                    PostsCount = posts.Count(),
                    FriendsCount = 0, // Will be calculated properly later
                    PublicPostsCount = publicPosts,
                    FriendStatus = FriendRequestStatus.Accepted
                });
            }
        }

        return friends;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync(int currentUserId, string? search = null, string? filter = null)
    {
        Console.WriteLine($"[GetAllUsersAsync] currentUserId: {currentUserId}, search: '{search}', filter: '{filter}'");
        
        var allUsers = await _userRepository.GetAllAsync();
        Console.WriteLine($"[GetAllUsersAsync] Total users in DB: {allUsers.Count()}");
        
        var users = allUsers.Where(u => u.Id != currentUserId).ToList();
        Console.WriteLine($"[GetAllUsersAsync] Users excluding current: {users.Count()}");

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            users = users.Where(u =>
                u.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                u.Email.Contains(search, StringComparison.OrdinalIgnoreCase)
            ).ToList();
            Console.WriteLine($"[GetAllUsersAsync] Users after search: {users.Count()}");
        }

        var result = new List<UserDto>();
        foreach (var user in users)
        {
            Console.WriteLine($"[GetAllUsersAsync] Processing user {user.Id}: {user.Name}");
            
            try
            {
                var posts = await _postRepository.GetByAuthorIdAsync(user.Id);
                Console.WriteLine($"[GetAllUsersAsync] User {user.Id} has {posts.Count()} posts");
                
                var friendRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(currentUserId, user.Id);
                var reverseRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(user.Id, currentUserId);

                FriendRequestStatus? friendStatus = null;
                if (friendRequest != null)
                {
                    friendStatus = friendRequest.Status;
                    Console.WriteLine($"[GetAllUsersAsync] User {user.Id} friendStatus (direct): {friendStatus}");
                }
                else if (reverseRequest != null)
                {
                    friendStatus = reverseRequest.Status;
                    Console.WriteLine($"[GetAllUsersAsync] User {user.Id} friendStatus (reverse): {friendStatus}");
                }
                else
                {
                    Console.WriteLine($"[GetAllUsersAsync] User {user.Id} friendStatus: null");
                }

                // Apply filter
                if (!string.IsNullOrWhiteSpace(filter))
                {
                    Console.WriteLine($"[GetAllUsersAsync] Applying filter '{filter}' for user {user.Id}");
                    if (filter == "friends" && friendStatus != FriendRequestStatus.Accepted)
                    {
                        Console.WriteLine($"[GetAllUsersAsync] User {user.Id} skipped (not friends)");
                        continue;
                    }
                    if (filter == "not_friends" && friendStatus == FriendRequestStatus.Accepted)
                    {
                        Console.WriteLine($"[GetAllUsersAsync] User {user.Id} skipped (is friend)");
                        continue;
                    }
                    if (filter == "pending" && friendStatus != FriendRequestStatus.Pending)
                    {
                        Console.WriteLine($"[GetAllUsersAsync] User {user.Id} skipped (not pending)");
                        continue;
                    }
                }

                var publicPosts = posts.Count(p => p.Visibility == BlogVisibility.Public);
                result.Add(new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Avatar = user.Avatar,
                    CreatedAt = user.CreatedAt,
                    PostsCount = posts.Count(),
                    FriendsCount = 0, // Will be calculated properly later
                    PublicPostsCount = publicPosts,
                    FriendStatus = friendStatus
                });
                Console.WriteLine($"[GetAllUsersAsync] User {user.Id} added to result");
            }
            catch (Exception ex)
            {
                // Log error but continue with other users
                Console.WriteLine($"[GetAllUsersAsync] Error processing user {user.Id}: {ex.Message}");
                Console.WriteLine($"[GetAllUsersAsync] Stack trace: {ex.StackTrace}");
                
                // Add user with default values if post query fails
                var friendRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(currentUserId, user.Id);
                var reverseRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(user.Id, currentUserId);

                FriendRequestStatus? friendStatus = null;
                if (friendRequest != null)
                {
                    friendStatus = friendRequest.Status;
                }
                else if (reverseRequest != null)
                {
                    friendStatus = reverseRequest.Status;
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

                result.Add(new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Avatar = user.Avatar,
                    CreatedAt = user.CreatedAt,
                    PostsCount = 0,
                    FriendsCount = 0,
                    PublicPostsCount = 0,
                    FriendStatus = friendStatus
                });
                Console.WriteLine($"[GetAllUsersAsync] User {user.Id} added to result (error fallback)");
            }
        }

        Console.WriteLine($"[GetAllUsersAsync] Final result count: {result.Count()}");
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
