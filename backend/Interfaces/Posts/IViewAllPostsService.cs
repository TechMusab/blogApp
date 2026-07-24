using BlogApi.DTOs;

namespace BlogApi.Interfaces.Posts;

public interface IViewAllPostsService
{
    Task<IEnumerable<PostDto>> GetAllPostsAsync();
    Task<PagedResult<PostDto>> GetAllPostsPagedAsync(int pageNumber, int pageSize);
}
