using BlogApi.DTOs;

namespace BlogApi.Interfaces.Posts;

public interface IYourPostsService
{
    Task<IEnumerable<PostDto>> GetUserPostsAsync(int userId);
}
