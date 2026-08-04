using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using BlogApi.Mappers;
using BlogApi.Models;
using BlogApi.Repositories;

public class ViewPostService : IViewPostService
{
    private readonly IPostRepository _postRepository;
    private readonly IFriendRequestRepository _friendRequestRepository;

    public ViewPostService(IPostRepository postRepository, IFriendRequestRepository friendRequestRepository)
    {
        _postRepository = postRepository;
        _friendRequestRepository = friendRequestRepository;
    }

    public async Task<PostDto?> GetPostByIdAsync(int id, int? userId = null)
    {
        var post = await _postRepository.GetByIdWithIncludesAsync(id);
        if (post is null)
        {
            return null;
        }

        // Check visibility rules
        if (!await CanUserViewPostAsync(post, userId))
        {
            return null;
        }

        // Get friend status if userId is provided and not the author
        FriendRequestStatus? friendStatus = null;
        string? friendRequestDirection = null;
        if (userId.HasValue && post.UserId != userId.Value)
        {
            var friendRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(userId.Value, post.UserId);
            var reverseRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(post.UserId, userId.Value);

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
        }
        return PostMapper.ToPostDto(post, friendStatus, friendRequestDirection);
    }

    private async Task<bool> CanUserViewPostAsync(Post post, int? userId)
    {
        // Owner can always view their posts
        if (userId.HasValue && post.UserId == userId.Value)
        {
            return true;
        }

        // Public posts are visible to everyone
        if (post.Visibility == BlogVisibility.Public)
        {
            return true;
        }

        // FriendsOnly posts
        if (post.Visibility == BlogVisibility.FriendsOnly && userId.HasValue)
        {
            var friendRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(userId.Value, post.UserId);
            var reverseRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(post.UserId, userId.Value);

            var isFriend = (friendRequest?.Status == FriendRequestStatus.Accepted) ||
                          (reverseRequest?.Status == FriendRequestStatus.Accepted);

            return isFriend;
        }

        // Private posts - only owner can view
        return false;
    }
}
