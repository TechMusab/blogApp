using BlogApi.DTOs;
using BlogApi.Interfaces.PostInteractions;
using BlogApi.Mappers;
using BlogApi.Models;
using BlogApi.Repositories;
using BlogApi.Services.Sanitization;

public class CommentPostService : ICommentPostService
{
    private readonly IPostRepository _postRepository;
    private readonly ICommentRepository _commentRepository;
    private readonly ISanitizationService _sanitizationService;

    public CommentPostService(IPostRepository postRepository, ICommentRepository commentRepository, ISanitizationService sanitizationService)
    {
        _postRepository = postRepository;
        _commentRepository = commentRepository;
        _sanitizationService = sanitizationService;
    }

    public async Task<CommentDto> AddCommentAsync(int userId, int postId, AddCommentRequest request)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        if (post is null)
        {
            throw new InvalidOperationException("Post not found.");
        }

        var comment = new Comment
        {
            Content = _sanitizationService.SanitizeInput(request.Text.Trim()),
            PostId = postId,
            UserId = userId
        };

        await _commentRepository.AddAsync(comment);
        await _commentRepository.SaveChangesAsync();

        var created = await _commentRepository.GetByIdWithUserAsync(comment.Id);
        return PostMapper.ToCommentDto(created);
    }
}
