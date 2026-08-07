namespace BlogApi.Interfaces.Posts;

public interface IDeletePostService
{
    Task DeletePostAsync(int postId, int userId);
}
