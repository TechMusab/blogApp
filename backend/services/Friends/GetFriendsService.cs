using BlogApi.DTOs;
using BlogApi.Interfaces.Friends;
using BlogApi.Models;
using BlogApi.Repositories;
using BlogApi.Models;
using BlogApi.DTOs;

namespace BlogApi.Services.Friends;

public class GetFriendsService : IGetFriendsService
{
    private readonly IFriendRequestRepository _friendRequestRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPostRepository _postRepository;

    public GetFriendsService(
        IFriendRequestRepository friendRequestRepository,
        IUserRepository userRepository,
        IPostRepository postRepository)
    {
        _friendRequestRepository = friendRequestRepository;
        _userRepository = userRepository;
        _postRepository = postRepository;
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
}
