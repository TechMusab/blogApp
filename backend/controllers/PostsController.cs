using System.Security.Claims;
using System.Text.Json;
using BlogApi.Data;
using BlogApi.DTOs;
using BlogApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private const string DefaultCoverImage = "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80";
    private readonly BlogDbContext _context;

    public PostsController(BlogDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetPosts()
    {
        var posts = await BasePostQuery()
            .OrderByDescending(post => post.CreatedAt)
            .ToListAsync();

        return Ok(posts.Select(ToPostDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PostDto>> GetPost(int id)
    {
        var post = await BasePostQuery().SingleOrDefaultAsync(entry => entry.Id == id);
        return post is null ? NotFound() : Ok(ToPostDto(post));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<PostDto>> CreatePost(CreatePostRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var content = request.Content.Trim();
        var paragraphs = request.Paragraphs?.Where(value => !string.IsNullOrWhiteSpace(value)).ToArray()
            ?? content.Split("\n\n", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var wordCount = content.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length;

        var post = new Post
        {
            Title = request.Title.Trim(),
            Excerpt = string.IsNullOrWhiteSpace(request.Excerpt) ? "A short description of this post." : request.Excerpt.Trim(),
            Content = content,
            CoverImage = string.IsNullOrWhiteSpace(request.CoverImage) ? DefaultCoverImage : request.CoverImage.Trim(),
            ImageUrl = string.IsNullOrWhiteSpace(request.CoverImage) ? DefaultCoverImage : request.CoverImage.Trim(),
            Category = request.Category.Trim(),
            ReadTime = $"{Math.Max(1, (int)Math.Ceiling(wordCount / 200d))} min read",
            Featured = request.Featured,
            Quote = request.Quote,
            TagsJson = SerializeOptional(request.Tags),
            ParagraphsJson = SerializeOptional(paragraphs),
            UserId = userId.Value
        };

        _context.Posts.Add(post);
        await _context.SaveChangesAsync();

        var created = await BasePostQuery().SingleAsync(entry => entry.Id == post.Id);
        return CreatedAtAction(nameof(GetPost), new { id = post.Id }, ToPostDto(created));
    }

    [Authorize]
    [HttpPost("{id:int}/like")]
    public async Task<ActionResult<ToggleResponse>> ToggleLike(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var postExists = await _context.Posts.AnyAsync(post => post.Id == id);
        if (!postExists)
        {
            return NotFound();
        }

        var like = await _context.PostLikes.FindAsync(userId.Value, id);
        var active = like is null;

        if (like is null)
        {
            _context.PostLikes.Add(new PostLike { UserId = userId.Value, PostId = id });
        }
        else
        {
            _context.PostLikes.Remove(like);
        }

        await _context.SaveChangesAsync();
        return Ok(new ToggleResponse { Active = active });
    }

    [Authorize]
    [HttpPost("{id:int}/comments")]
    public async Task<ActionResult<CommentDto>> AddComment(int id, AddCommentRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var postExists = await _context.Posts.AnyAsync(post => post.Id == id);
        if (!postExists)
        {
            return NotFound();
        }

        var comment = new Comment
        {
            Content = request.Text.Trim(),
            PostId = id,
            UserId = userId.Value
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var created = await _context.Comments
            .Include(entry => entry.User)
            .SingleAsync(entry => entry.Id == comment.Id);

        return CreatedAtAction(nameof(GetPost), new { id }, ToCommentDto(created));
    }

    [Authorize]
    [HttpGet("saved")]
    public async Task<ActionResult<IEnumerable<string>>> GetSavedPostIds()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var savedIds = await _context.SavedPosts
            .Where(saved => saved.UserId == userId.Value)
            .OrderByDescending(saved => saved.CreatedAt)
            .Select(saved => saved.PostId.ToString())
            .ToListAsync();

        return Ok(savedIds);
    }

    [Authorize]
    [HttpPost("{id:int}/save")]
    public async Task<ActionResult<ToggleResponse>> ToggleSaved(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var postExists = await _context.Posts.AnyAsync(post => post.Id == id);
        if (!postExists)
        {
            return NotFound();
        }

        var saved = await _context.SavedPosts.FindAsync(userId.Value, id);
        var active = saved is null;

        if (saved is null)
        {
            _context.SavedPosts.Add(new SavedPost { UserId = userId.Value, PostId = id });
        }
        else
        {
            _context.SavedPosts.Remove(saved);
        }

        await _context.SaveChangesAsync();
        return Ok(new ToggleResponse { Active = active });
    }

    [Authorize]
    [HttpDelete("saved")]
    public async Task<IActionResult> ClearSavedPosts()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var savedPosts = await _context.SavedPosts
            .Where(saved => saved.UserId == userId.Value)
            .ToListAsync();

        _context.SavedPosts.RemoveRange(savedPosts);
        await _context.SaveChangesAsync();
        return NoContent();
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

    private int? GetCurrentUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdValue, out var userId) ? userId : null;
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
        return cleaned is { Length: > 0 } ? JsonSerializer.Serialize(cleaned) : null;
    }

    private static string[]? DeserializeOptional(string? json)
    {
        return string.IsNullOrWhiteSpace(json) ? null : JsonSerializer.Deserialize<string[]>(json);
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
