using BlogApi.DTOs;

namespace BlogApi.Interfaces.PostInteractions;

public interface IUpdateCommentService
{
    Task<CommentDto> UpdateCommentAsync(int commentId, int userId, UpdateCommentRequest request);
}
