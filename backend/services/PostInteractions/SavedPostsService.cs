using BlogApi.Data;
using BlogApi.DTOs;
using BlogApi.Interfaces.PostInteractions;
using BlogApi.Models;
using BlogApi.Repositories;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Services.PostInteractions;

public class SavedPostsService : ISavedPostsService
{
    private readonly IPostRepository _postRepository;
    private readonly BlogDbContext _context;

    public SavedPostsService(IPostRepository postRepository, BlogDbContext context)
    {
        _postRepository = postRepository;
        _context = context;
    }

    public async Task<IEnumerable<string>> GetSavedPostIdsAsync(int userId)
    {
        var savedIds = await _context.SavedPosts
            .Where(saved => saved.UserId == userId)
            .OrderByDescending(saved => saved.CreatedAt)
            .Select(saved => saved.PostId.ToString())
            .ToListAsync();

        return savedIds;
    }

    public async Task<ToggleResponse> ToggleSavedAsync(int userId, int postId)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        if (post is null)
        {
            throw new InvalidOperationException("Post not found.");
        }

        var saved = await _context.SavedPosts.FindAsync(userId, postId);
        var active = saved is null;

        if (saved is null)
        {
            _context.SavedPosts.Add(new SavedPost { UserId = userId, PostId = postId });
        }
        else
        {
            _context.SavedPosts.Remove(saved);
        }

        await _context.SaveChangesAsync();
        return new ToggleResponse { Active = active };
    }

    public async Task ClearSavedPostsAsync(int userId)
    {
        var savedPosts = await _context.SavedPosts
            .Where(saved => saved.UserId == userId)
            .ToListAsync();

        _context.SavedPosts.RemoveRange(savedPosts);
        await _context.SaveChangesAsync();
    }
}
