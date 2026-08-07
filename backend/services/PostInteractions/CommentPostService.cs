using BlogApi.DTOs;
using BlogApi.Helpers;
using BlogApi.Interfaces.Notifications;
using BlogApi.Interfaces.PostInteractions;
using BlogApi.Interfaces.Users;
using BlogApi.Mappers;
using BlogApi.Models;
using BlogApi.Repositories;
using BlogApi.Services.Sanitization;

public class CommentPostService : ICommentPostService
{
    private readonly IPostRepository _postRepository;
    private readonly ICommentRepository _commentRepository;
    private readonly ISanitizationService _sanitizationService;
    private readonly INotificationService _notificationService;
    private readonly IUserRepository _userRepository;

    public CommentPostService(IPostRepository postRepository, ICommentRepository commentRepository, ISanitizationService sanitizationService, INotificationService notificationService, IUserRepository userRepository)
    {
        _postRepository = postRepository;
        _commentRepository = commentRepository;
        _sanitizationService = sanitizationService;
        _notificationService = notificationService;
        _userRepository = userRepository;
    }

    public async Task<CommentDto> AddCommentAsync(int userId, int postId, AddCommentRequest request)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        ExceptionsHelper.ThrowIfNotFound(post, "Post not found.");

        var comment = new Comment
        {
            Content = _sanitizationService.SanitizeInput(request.Text.Trim()),
            PostId = postId,
            UserId = userId
        };

        await _commentRepository.AddAsync(comment);
        await _commentRepository.SaveChangesAsync();

        // Create notification for post author if commenter is not the author
        if (post.UserId != userId)
        {
            var commenter = await _userRepository.GetByIdAsync(userId);
            if (commenter != null)
            {
                var message = $"{commenter.Name} commented on your post \"{post.Title}\".";
                await _notificationService.CreateNotificationAsync(
                    recipientUserId: post.UserId,
                    actorUserId: userId,
                    type: NotificationType.Comment,
                    message: message,
                    postId: postId,
                    commentId: comment.Id
                );
            }
        }

        var created = await _commentRepository.GetByIdWithUserAsync(comment.Id);
        return PostMapper.ToCommentDto(created);
    }
}
