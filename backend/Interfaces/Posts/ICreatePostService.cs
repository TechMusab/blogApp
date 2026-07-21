using BlogApi.DTOs;

namespace BlogApi.Interfaces.Posts;

public interface ICreatePostService
{
    Task<PostDto> CreatePostAsync(int userId, CreatePostRequest request);
}
