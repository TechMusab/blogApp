using BlogApi.DTOs;

namespace BlogApi.Interfaces.Posts;

public interface ISearchPostService
{
    Task<IEnumerable<PostDto>> SearchPostsAsync(string query);
}
