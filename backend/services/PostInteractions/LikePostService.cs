using BlogApi.DTOs;
using BlogApi.Helpers;
using BlogApi.Interfaces.Notifications;
using BlogApi.Interfaces.PostInteractions;
using BlogApi.Interfaces.Users;
using BlogApi.Models;
using BlogApi.Repositories;

namespace BlogApi.Services.PostInteractions;

public class LikePostService : ILikePostService
{
    private readonly IPostRepository _postRepository;
    private readonly IPostLikeRepository _postLikeRepository;
    private readonly INotificationService _notificationService;
    private readonly IUserRepository _userRepository;

    public LikePostService(IPostRepository postRepository, IPostLikeRepository postLikeRepository, INotificationService notificationService, IUserRepository userRepository)
    {
        _postRepository = postRepository;
        _postLikeRepository = postLikeRepository;
        _notificationService = notificationService;
        _userRepository = userRepository;
    }

    public async Task<ToggleResponse> ToggleLikeAsync(int userId, int postId)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        ExceptionsHelper.ThrowIfNotFound(post, "Post not found.");

        var like = await _postLikeRepository.FindAsync(userId, postId);
        var active = like is null;

        if (like is null)
        {
            await _postLikeRepository.AddAsync(new PostLike { UserId = userId, PostId = postId });
            
            // Create notification for post author if liker is not the author
            if (post.UserId != userId)
            {
                var liker = await _userRepository.GetByIdAsync(userId);
                if (liker != null)
                {
                    var message = $"{liker.Name} liked your post \"{post.Title}\".";
                    await _notificationService.CreateNotificationAsync(
                        recipientUserId: post.UserId,
                        actorUserId: userId,
                        type: NotificationType.Like,
                        message: message,
                        postId: postId
                    );
                }
            }
        }
        else
        {
            await _postLikeRepository.RemoveAsync(like);
        }

        await _postLikeRepository.SaveChangesAsync();
        return new ToggleResponse { Active = active };
    }
}
