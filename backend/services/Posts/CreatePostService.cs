using BlogApi.Data;
using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using BlogApi.Models;
using BlogApi.Repositories;
using BlogApi.Services.Sanitization;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Services.Posts;

public class CreatePostService : ICreatePostService
{
    private const string DefaultCoverImage = "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80";
    private readonly IPostRepository _postRepository;
    private readonly BlogDbContext _context;
    private readonly ISanitizationService _sanitizationService;

    public CreatePostService(IPostRepository postRepository, BlogDbContext context, ISanitizationService sanitizationService)
    {
        _postRepository = postRepository;
        _context = context;
        _sanitizationService = sanitizationService;
    }

    public async Task<PostDto> CreatePostAsync(int userId, CreatePostRequest request)
    {
        var content = request.Content.Trim();
        var paragraphs = request.Paragraphs?.Where(value => !string.IsNullOrWhiteSpace(value)).ToArray()
            ?? content.Split("\n\n", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var wordCount = content.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length;

        var post = new Post
        {
            Title = _sanitizationService.SanitizeInput(request.Title.Trim()),
            Excerpt = string.IsNullOrWhiteSpace(request.Excerpt) ? "A short description of this post." : _sanitizationService.SanitizeInput(request.Excerpt.Trim()),
            Content = _sanitizationService.SanitizeInput(content),
            CoverImage = string.IsNullOrWhiteSpace(request.CoverImage) ? DefaultCoverImage : _sanitizationService.SanitizeInput(request.CoverImage.Trim()),
            ImageUrl = string.IsNullOrWhiteSpace(request.CoverImage) ? DefaultCoverImage : _sanitizationService.SanitizeInput(request.CoverImage.Trim()),
            Category = _sanitizationService.SanitizeInput(request.Category.Trim()),
            ReadTime = $"{Math.Max(1, (int)Math.Ceiling(wordCount / 200d))} min read",
            Featured = request.Featured,
            Quote = request.Quote != null ? _sanitizationService.SanitizeInput(request.Quote) : null,
            TagsJson = SerializeOptional(_sanitizationService.SanitizeArray(request.Tags ?? Array.Empty<string>())),
            ParagraphsJson = SerializeOptional(_sanitizationService.SanitizeArray(paragraphs ?? Array.Empty<string>())),
            UserId = userId
        };

        await _postRepository.AddAsync(post);
        await _postRepository.SaveChangesAsync();

        var created = await BasePostQuery().SingleAsync(entry => entry.Id == post.Id);
        return ToPostDto(created);
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

    private static string? SerializeOptional(string[]? values)
    {
        var cleaned = values?.Where(value => !string.IsNullOrWhiteSpace(value)).Select(value => value.Trim()).ToArray();
        return cleaned is { Length: > 0 } ? System.Text.Json.JsonSerializer.Serialize(cleaned) : null;
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
