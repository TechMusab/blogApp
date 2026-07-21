using BlogApi.DTOs;

namespace BlogApi.Interfaces.Posts;

public interface IViewAllPostsService
{
    Task<IEnumerable<PostDto>> GetAllPostsAsync();
}
