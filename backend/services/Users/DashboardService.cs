using BlogApi.DTOs;
using BlogApi.Interfaces.Users;
using BlogApi.Models;
using BlogApi.Repositories;

namespace BlogApi.Services.Users;

public class DashboardService : IDashboardService
{
    private readonly IPostRepository _postRepository;
    private readonly IFriendRequestRepository _friendRequestRepository;

    public DashboardService(
        IPostRepository postRepository,
        IFriendRequestRepository friendRequestRepository)
    {
        _postRepository = postRepository;
        _friendRequestRepository = friendRequestRepository;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(int userId)
    {
        var posts = await _postRepository.GetByAuthorIdAsync(userId);
        var acceptedRequests = await _friendRequestRepository.GetAcceptedRequestsAsync(userId);
        var incomingRequests = await _friendRequestRepository.GetIncomingRequestsAsync(userId);
        var outgoingRequests = await _friendRequestRepository.GetOutgoingRequestsAsync(userId);

        return new DashboardStatsDto
        {
            TotalPosts = posts.Count(),
            PublicPosts = posts.Count(p => p.Visibility == BlogVisibility.Public),
            FriendsOnlyPosts = posts.Count(p => p.Visibility == BlogVisibility.FriendsOnly),
            PrivatePosts = posts.Count(p => p.Visibility == BlogVisibility.Private),
            FriendsCount = acceptedRequests.Count(),
            PendingRequests = outgoingRequests.Count(),
            ReceivedRequests = incomingRequests.Count()
        };
    }
}
