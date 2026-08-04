using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using BlogApi.Mappers;
using BlogApi.Models;
using BlogApi.Repositories;

public class ViewAllPostsService : IViewAllPostsService
{
    private readonly IPostRepository _postRepository;
    private readonly IFriendRequestRepository _friendRequestRepository;

    public ViewAllPostsService(IPostRepository postRepository, IFriendRequestRepository friendRequestRepository)
    {
        _postRepository = postRepository;
        _friendRequestRepository = friendRequestRepository;
    }

    public async Task<IEnumerable<PostDto>> GetAllPostsAsync(int? userId = null)
    {
        var posts = await _postRepository.GetAllWithIncludesAsync();
        var filteredPosts = await FilterPostsByVisibilityAsync(posts, userId);
        return filteredPosts.Select(PostMapper.ToPostDto);
    }

    public async Task<PagedResult<PostDto>> GetAllPostsPagedAsync(int pageNumber, int pageSize, int? userId = null)
    {
        var pagedPosts = await _postRepository.GetAllWithIncludesPagedAsync(pageNumber, pageSize);
        var filteredPosts = await FilterPostsByVisibilityAsync(pagedPosts.Items, userId);
        return new PagedResult<PostDto>
        {
            Items = filteredPosts.Select(PostMapper.ToPostDto),
            TotalCount = filteredPosts.Count(),
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    private async Task<IEnumerable<Post>> FilterPostsByVisibilityAsync(IEnumerable<Post> posts, int? userId)
    {
        if (!userId.HasValue)
        {
            // Non-authenticated users can only see Public posts
            return posts.Where(p => p.Visibility == BlogVisibility.Public);
        }

        var filteredPosts = new List<Post>();
        foreach (var post in posts)
        {
            // Owner can see all their posts
            if (post.UserId == userId.Value)
            {
                filteredPosts.Add(post);
                continue;
            }

            // Public posts are visible to everyone
            if (post.Visibility == BlogVisibility.Public)
            {
                filteredPosts.Add(post);
                continue;
            }

            // FriendsOnly posts - check if user is friends with post owner
            if (post.Visibility == BlogVisibility.FriendsOnly)
            {
                var friendRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(userId.Value, post.UserId);
                var reverseRequest = await _friendRequestRepository.GetBySenderAndReceiverAsync(post.UserId, userId.Value);

                var isFriend = (friendRequest?.Status == FriendRequestStatus.Accepted) ||
                              (reverseRequest?.Status == FriendRequestStatus.Accepted);

                if (isFriend)
                {
                    filteredPosts.Add(post);
                }
            }

            // Private posts - only owner can see (already handled above)
        }

        return filteredPosts;
    }
}
