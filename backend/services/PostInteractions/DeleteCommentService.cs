using BlogApi.Interfaces.PostInteractions;
using BlogApi.Models;
using BlogApi.Repositories;

namespace BlogApi.Services.PostInteractions;

public class DeleteCommentService : IDeleteCommentService
{
    private readonly ICommentRepository _commentRepository;

    public DeleteCommentService(ICommentRepository commentRepository)
    {
        _commentRepository = commentRepository;
    }

    public async Task DeleteCommentAsync(int commentId, int userId)
    {
        var comment = await _commentRepository.GetByIdAsync(commentId);
        if (comment == null)
        {
            throw new KeyNotFoundException($"Comment with ID {commentId} not found.");
        }

        if (comment.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only delete your own comments.");
        }

        await _commentRepository.DeleteAsync(comment);
        await _commentRepository.SaveChangesAsync();
    }
}
