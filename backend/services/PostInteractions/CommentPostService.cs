using BlogApi.Data;
using BlogApi.DTOs;
using BlogApi.Interfaces.PostInteractions;
using BlogApi.Models;
using BlogApi.Services.Sanitization;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Services.PostInteractions;

public class CommentPostService : ICommentPostService
{
    private readonly BlogDbContext _context;
    private readonly ISanitizationService _sanitizationService;

    public CommentPostService(BlogDbContext context, ISanitizationService sanitizationService)
    {
        _context = context;
        _sanitizationService = sanitizationService;
    }

    public async Task<CommentDto> AddCommentAsync(int userId, int postId, AddCommentRequest request)
    {
        var post = await _context.Posts.FindAsync(postId);
        if (post is null)
        {
            throw new InvalidOperationException("Post not found.");
        }

        var comment = new Comment
        {
            Content = _sanitizationService.SanitizeInput(request.Text.Trim()),
            PostId = postId,
            UserId = userId
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var created = await _context.Comments
            .Include(entry => entry.User)
            .SingleAsync(entry => entry.Id == comment.Id);

        return ToCommentDto(created);
    }

    private static CommentDto ToCommentDto(Comment comment)
    {
        return new CommentDto
        {
            Id = comment.Id.ToString(),
            Author = comment.User.Name,
            Avatar = BuildAvatar(comment.User.Name),
            Text = comment.Content,
            Date = comment.CreatedAt.ToString("MMM d, yyyy")
        };
    }

    private static string BuildAvatar(string name)
    {
        var avatar = string.Concat(name
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Take(2)
            .Select(part => part[0].ToString().ToUpperInvariant()));

        return string.IsNullOrWhiteSpace(avatar) ? "U" : avatar;
    }
}
