using BlogApi.Data;
using BlogApi.DTOs;
using BlogApi.Interfaces.PostInteractions;
using BlogApi.Models;
using BlogApi.Repositories;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Services.PostInteractions;

public class LikePostService : ILikePostService
{
    private readonly IPostRepository _postRepository;
    private readonly BlogDbContext _context;

    public LikePostService(IPostRepository postRepository, BlogDbContext context)
    {
        _postRepository = postRepository;
        _context = context;
    }

    public async Task<ToggleResponse> ToggleLikeAsync(int userId, int postId)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        if (post is null)
        {
            throw new InvalidOperationException("Post not found.");
        }

        var like = await _context.PostLikes.FindAsync(userId, postId);
        var active = like is null;

        if (like is null)
        {
            _context.PostLikes.Add(new PostLike { UserId = userId, PostId = postId });
        }
        else
        {
            _context.PostLikes.Remove(like);
        }

        await _context.SaveChangesAsync();
        return new ToggleResponse { Active = active };
    }
}
