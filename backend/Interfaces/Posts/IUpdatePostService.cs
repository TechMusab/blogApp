using BlogApi.DTOs;

namespace BlogApi.Interfaces.Posts;

public interface IUpdatePostService
{
    Task<PostDto> UpdatePostAsync(int postId, int userId, UpdatePostRequest request);
}
