using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using BlogApi.Mappers;
using BlogApi.Models;
using BlogApi.Repositories;
using BlogApi.Services.Sanitization;

namespace BlogApi.Services.Posts;

public class UpdatePostService : IUpdatePostService
{
    private const string DefaultCoverImage = "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80";
    private readonly IPostRepository _postRepository;
    private readonly ISanitizationService _sanitizationService;

    public UpdatePostService(IPostRepository postRepository, ISanitizationService sanitizationService)
    {
        _postRepository = postRepository;
        _sanitizationService = sanitizationService;
    }

    public async Task<PostDto> UpdatePostAsync(int postId, int userId, UpdatePostRequest request)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        if (post == null)
        {
            throw new KeyNotFoundException($"Post with ID {postId} not found.");
        }

        if (post.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only edit your own posts.");
        }

        var content = request.Content.Trim();
        var paragraphs = request.Paragraphs?.Where(value => !string.IsNullOrWhiteSpace(value)).ToArray()
            ?? content.Split("\n\n", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var wordCount = content.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length;

        post.Title = _sanitizationService.SanitizeInput(request.Title.Trim());
        post.Excerpt = string.IsNullOrWhiteSpace(request.Excerpt) ? GenerateExcerptFromContent(content) : _sanitizationService.SanitizeInput(request.Excerpt.Trim());
        post.Content = _sanitizationService.SanitizeInput(content);
        post.CoverImage = string.IsNullOrWhiteSpace(request.CoverImage) ? DefaultCoverImage : _sanitizationService.SanitizeInput(request.CoverImage.Trim());
        post.ImageUrl = string.IsNullOrWhiteSpace(request.CoverImage) ? DefaultCoverImage : _sanitizationService.SanitizeInput(request.CoverImage.Trim());
        post.Category = string.IsNullOrWhiteSpace(request.Category) ? "General" : _sanitizationService.SanitizeInput(request.Category.Trim());
        post.ReadTime = $"{Math.Max(1, (int)Math.Ceiling(wordCount / 200d))} min read";
        post.Featured = request.Featured;
        post.Quote = !string.IsNullOrWhiteSpace(request.Quote) ? _sanitizationService.SanitizeInput(request.Quote) : null;
        post.TagsJson = SerializeOptional(_sanitizationService.SanitizeArray(request.Tags ?? Array.Empty<string>()));
        post.ParagraphsJson = SerializeOptional(_sanitizationService.SanitizeArray(paragraphs ?? Array.Empty<string>()));
        post.Visibility = request.Visibility;
        post.UpdatedAt = DateTime.UtcNow;

        await _postRepository.UpdateAsync(post);
        await _postRepository.SaveChangesAsync();

        var updated = await _postRepository.GetByIdWithIncludesAsync(post.Id);
        return PostMapper.ToPostDto(updated);
    }

    private static string GenerateExcerptFromContent(string content)
    {
        var words = content.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
        var excerpt = string.Join(" ", words.Take(20));
        return excerpt.Length > 150 ? excerpt.Substring(0, 147) + "..." : excerpt;
    }

    private static string? SerializeOptional(string[]? values)
    {
        return PostMapper.SerializeOptional(values);
    }
}
