using BlogApi.Data;
using BlogApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Repositories;

public class PostLikeRepository : IPostLikeRepository
{
    private readonly BlogDbContext _context;

    public PostLikeRepository(BlogDbContext context)
    {
        _context = context;
    }

    public async Task<PostLike?> FindAsync(int userId, int postId)
    {
        return await _context.PostLikes.FindAsync(userId, postId);
    }

    public async Task AddAsync(PostLike postLike)
    {
        await _context.PostLikes.AddAsync(postLike);
    }

    public async Task RemoveAsync(PostLike postLike)
    {
        _context.PostLikes.Remove(postLike);
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
