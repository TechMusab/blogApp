using BlogApi.DTOs;

namespace BlogApi.Interfaces.PostInteractions;

public interface ICommentPostService
{
    Task<CommentDto> AddCommentAsync(int userId, int postId, AddCommentRequest request);
}
