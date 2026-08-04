using BlogApi.DTOs;
using BlogApi.Interfaces.Users;
using BlogApi.Models;
using BlogApi.Repositories;

namespace BlogApi.Services.Users;

public class UserProfileService : IUserProfileService
{
    private readonly IUserRepository _userRepository;
    private readonly IPostRepository _postRepository;
    private readonly IFriendRequestRepository _friendRequestRepository;

    public UserProfileService(
        IUserRepository userRepository,
        IPostRepository postRepository,
        IFriendRequestRepository friendRequestRepository)
    {
        _userRepository = userRepository;
        _postRepository = postRepository;
        _friendRequestRepository = friendRequestRepository;
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(int userId, int? currentUserId = null)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return null;
        }

        var allPosts = await _postRepository.GetByAuthorIdAsync(userId);
        var isOwner = currentUserId.HasValue && currentUserId.Value == userId;

        // Determine friend status
        FriendRequestStatus? friendStatus = null;
        if (currentUserId.HasValue && !isOwner)
        {
            var friendRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(currentUserId.Value, userId);
            var reverseRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(userId, currentUserId.Value);

            if (friendRequest != null)
            {
                friendStatus = friendRequest.Status;
            }
            else if (reverseRequest != null)
            {
                friendStatus = reverseRequest.Status;
            }
        }

        // Calculate post counts based on visibility and friendship
        var totalPosts = allPosts.Count();
        var publicPosts = allPosts.Count(p => p.Visibility == BlogVisibility.Public);
        var friendsOnlyPosts = allPosts.Count(p => p.Visibility == BlogVisibility.FriendsOnly);
        var privatePosts = allPosts.Count(p => p.Visibility == BlogVisibility.Private);

        // Calculate friends count
        var acceptedRequests = await _friendRequestRepository.GetAcceptedRequestsAsync(userId);
        var friendsCount = acceptedRequests.Count();

        return new UserProfileDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Avatar = user.Avatar,
            Bio = user.Bio,
            CreatedAt = user.CreatedAt,
            TotalPosts = totalPosts,
            PublicPosts = publicPosts,
            FriendsOnlyPosts = friendsOnlyPosts,
            PrivatePosts = privatePosts,
            FriendsCount = friendsCount,
            FriendStatus = friendStatus
        };
    }
}
