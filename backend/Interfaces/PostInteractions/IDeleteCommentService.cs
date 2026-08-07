namespace BlogApi.Interfaces.PostInteractions;

public interface IDeleteCommentService
{
    Task DeleteCommentAsync(int commentId, int userId);
}
