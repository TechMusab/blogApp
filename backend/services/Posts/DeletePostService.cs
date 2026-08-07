using BlogApi.Interfaces.Posts;
using BlogApi.Models;
using BlogApi.Repositories;

namespace BlogApi.Services.Posts;

public class DeletePostService : IDeletePostService
{
    private readonly IPostRepository _postRepository;

    public DeletePostService(IPostRepository postRepository)
    {
        _postRepository = postRepository;
    }

    public async Task DeletePostAsync(int postId, int userId)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        if (post == null)
        {
            throw new KeyNotFoundException($"Post with ID {postId} not found.");
        }

        if (post.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only delete your own posts.");
        }

        await _postRepository.DeleteAsync(post);
        await _postRepository.SaveChangesAsync();
    }
}
