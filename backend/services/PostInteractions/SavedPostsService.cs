using BlogApi.DTOs;
using BlogApi.Interfaces.PostInteractions;
using BlogApi.Models;
using BlogApi.Repositories;

namespace BlogApi.Services.PostInteractions;

public class SavedPostsService : ISavedPostsService
{
    private readonly IPostRepository _postRepository;
    private readonly ISavedPostRepository _savedPostRepository;

    public SavedPostsService(IPostRepository postRepository, ISavedPostRepository savedPostRepository)
    {
        _postRepository = postRepository;
        _savedPostRepository = savedPostRepository;
    }

    public async Task<IEnumerable<string>> GetSavedPostIdsAsync(int userId)
    {
        return await _savedPostRepository.GetSavedPostIdsAsync(userId);
    }

    public async Task<ToggleResponse> ToggleSavedAsync(int userId, int postId)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        if (post is null)
        {
            throw new InvalidOperationException("Post not found.");
        }

        var saved = await _savedPostRepository.FindAsync(userId, postId);
        var active = saved is null;

        if (saved is null)
        {
            await _savedPostRepository.AddAsync(new SavedPost { UserId = userId, PostId = postId });
        }
        else
        {
            await _savedPostRepository.RemoveAsync(saved);
        }

        await _savedPostRepository.SaveChangesAsync();
        return new ToggleResponse { Active = active };
    }

    public async Task ClearSavedPostsAsync(int userId)
    {
        var savedPosts = await _savedPostRepository.GetByUserIdAsync(userId);
        await _savedPostRepository.RemoveRangeAsync(savedPosts);
        await _savedPostRepository.SaveChangesAsync();
    }
}
