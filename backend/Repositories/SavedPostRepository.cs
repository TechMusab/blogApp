using BlogApi.Data;
using BlogApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Repositories;

public class SavedPostRepository : ISavedPostRepository
{
    private readonly BlogDbContext _context;

    public SavedPostRepository(BlogDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<string>> GetSavedPostIdsAsync(int userId)
    {
        return await _context.SavedPosts
            .Where(saved => saved.UserId == userId)
            .OrderByDescending(saved => saved.CreatedAt)
            .Select(saved => saved.PostId.ToString())
            .ToListAsync();
    }

    public async Task<SavedPost?> FindAsync(int userId, int postId)
    {
        return await _context.SavedPosts.FindAsync(userId, postId);
    }

    public async Task AddAsync(SavedPost savedPost)
    {
        await _context.SavedPosts.AddAsync(savedPost);
    }

    public async Task RemoveAsync(SavedPost savedPost)
    {
        _context.SavedPosts.Remove(savedPost);
        await Task.CompletedTask;
    }

    public async Task<IEnumerable<SavedPost>> GetByUserIdAsync(int userId)
    {
        return await _context.SavedPosts
            .Where(saved => saved.UserId == userId)
            .ToListAsync();
    }

    public async Task RemoveRangeAsync(IEnumerable<SavedPost> savedPosts)
    {
        _context.SavedPosts.RemoveRange(savedPosts);
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
