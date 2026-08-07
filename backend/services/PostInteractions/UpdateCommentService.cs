using BlogApi.DTOs;
using BlogApi.Interfaces.PostInteractions;
using BlogApi.Mappers;
using BlogApi.Models;
using BlogApi.Repositories;
using BlogApi.Services.Sanitization;

namespace BlogApi.Services.PostInteractions;

public class UpdateCommentService : IUpdateCommentService
{
    private readonly ICommentRepository _commentRepository;
    private readonly ISanitizationService _sanitizationService;

    public UpdateCommentService(ICommentRepository commentRepository, ISanitizationService sanitizationService)
    {
        _commentRepository = commentRepository;
        _sanitizationService = sanitizationService;
    }

    public async Task<CommentDto> UpdateCommentAsync(int commentId, int userId, UpdateCommentRequest request)
    {
        var comment = await _commentRepository.GetByIdWithUserAsync(commentId);
        if (comment == null)
        {
            throw new KeyNotFoundException($"Comment with ID {commentId} not found.");
        }

        if (comment.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only edit your own comments.");
        }

        comment.Content = _sanitizationService.SanitizeInput(request.Text.Trim());
        comment.UpdatedAt = DateTime.UtcNow;

        await _commentRepository.UpdateAsync(comment);
        await _commentRepository.SaveChangesAsync();

        var updated = await _commentRepository.GetByIdWithUserAsync(commentId);
        return PostMapper.ToCommentDto(updated!);
    }
}
