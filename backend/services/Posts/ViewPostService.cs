using BlogApi.Data;
using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using BlogApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Services.Posts;

public class ViewPostService : IViewPostService
{
    private readonly BlogDbContext _context;

    public ViewPostService(BlogDbContext context)
    {
        _context = context;
    }

    public async Task<PostDto?> GetPostByIdAsync(int id)
    {
        var post = await BasePostQuery().SingleOrDefaultAsync(entry => entry.Id == id);
        return post is null ? null : ToPostDto(post);
    }

    private IQueryable<Post> BasePostQuery()
    {
        return _context.Posts
            .AsNoTracking()
            .Include(post => post.User)
            .Include(post => post.Likes)
            .Include(post => post.Comments)
                .ThenInclude(comment => comment.User);
    }

    private static PostDto ToPostDto(Post post)
    {
        return new PostDto
        {
            Id = post.Id.ToString(),
            Title = post.Title,
            Excerpt = post.Excerpt,
            Content = post.Content,
            CoverImage = string.IsNullOrWhiteSpace(post.CoverImage) ? post.ImageUrl ?? string.Empty : post.CoverImage,
            Category = post.Category,
            Tags = DeserializeOptional(post.TagsJson),
            AuthorId = post.UserId.ToString(),
            Author = post.User.Name,
            Avatar = BuildAvatar(post.User.Name),
            Date = post.CreatedAt.ToString("MMM d, yyyy"),
            ReadTime = post.ReadTime,
            Likes = post.Likes.Count,
            LikedBy = post.Likes.Select(like => like.UserId.ToString()).ToArray(),
            Comments = post.Comments.Count,
            Featured = post.Featured,
            Quote = post.Quote,
            Paragraphs = DeserializeOptional(post.ParagraphsJson),
            CommentsList = post.Comments.OrderBy(comment => comment.CreatedAt).Select(ToCommentDto).ToArray()
        };
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

    private static string[]? DeserializeOptional(string? json)
    {
        return string.IsNullOrWhiteSpace(json) ? null : System.Text.Json.JsonSerializer.Deserialize<string[]>(json);
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
