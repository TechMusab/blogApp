using BlogApi.DTOs;

namespace BlogApi.Interfaces.Posts;

public interface IViewAllPostsService
{
    Task<IEnumerable<PostDto>> GetAllPostsAsync(int? userId = null);
    Task<PagedResult<PostDto>> GetAllPostsPagedAsync(int pageNumber, int pageSize, int? userId = null);
}
