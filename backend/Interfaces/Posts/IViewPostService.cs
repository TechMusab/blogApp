using BlogApi.DTOs;

namespace BlogApi.Interfaces.Posts;

public interface IViewPostService
{
    Task<PostDto?> GetPostByIdAsync(int id, int? userId = null);
}
