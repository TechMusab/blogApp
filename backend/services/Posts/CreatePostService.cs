using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using BlogApi.Mappers;
using BlogApi.Models;
using BlogApi.Repositories;
using BlogApi.Services.Sanitization;
using System.Linq;

public class CreatePostService : ICreatePostService
{
    private const string DefaultCoverImage = "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80";
    private readonly IPostRepository _postRepository;
    private readonly ISanitizationService _sanitizationService;

    public CreatePostService(IPostRepository postRepository, ISanitizationService sanitizationService)
    {
        _postRepository = postRepository;
        _sanitizationService = sanitizationService;
    }

    public async Task<PostDto> CreatePostAsync(int userId, CreatePostRequest request)
    {
        var content = request.Content.Trim();
        var paragraphs = request.Paragraphs?.Where(value => !string.IsNullOrWhiteSpace(value)).ToArray()
            ?? content.Split("\n\n", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var wordCount = content.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length;

        // Auto-generate title from content if not provided
        var title = string.IsNullOrWhiteSpace(request.Title) 
            ? GenerateTitleFromContent(content) 
            : _sanitizationService.SanitizeInput(request.Title.Trim());

        var post = new Post
        {
            Title = title,
            Excerpt = string.IsNullOrWhiteSpace(request.Excerpt) ? GenerateExcerptFromContent(content) : _sanitizationService.SanitizeInput(request.Excerpt.Trim()),
            Content = _sanitizationService.SanitizeInput(content),
            CoverImage = string.IsNullOrWhiteSpace(request.CoverImage) ? DefaultCoverImage : _sanitizationService.SanitizeInput(request.CoverImage.Trim()),
            ImageUrl = string.IsNullOrWhiteSpace(request.CoverImage) ? DefaultCoverImage : _sanitizationService.SanitizeInput(request.CoverImage.Trim()),
            Category = string.IsNullOrWhiteSpace(request.Category) ? "General" : _sanitizationService.SanitizeInput(request.Category.Trim()),
            ReadTime = $"{Math.Max(1, (int)Math.Ceiling(wordCount / 200d))} min read",
            Featured = request.Featured,
            Quote = !string.IsNullOrWhiteSpace(request.Quote) ? _sanitizationService.SanitizeInput(request.Quote) : null,
            TagsJson = SerializeOptional(_sanitizationService.SanitizeArray(request.Tags ?? Array.Empty<string>())),
            ParagraphsJson = SerializeOptional(_sanitizationService.SanitizeArray(paragraphs ?? Array.Empty<string>())),
            UserId = userId
        };

        await _postRepository.AddAsync(post);
        await _postRepository.SaveChangesAsync();

        var created = await _postRepository.GetByIdWithIncludesAsync(post.Id);
        return PostMapper.ToPostDto(created);
    }

    private static string GenerateTitleFromContent(string content)
    {
        var firstLine = content.Split('\n', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        return string.IsNullOrWhiteSpace(firstLine) ? "Untitled Post" : firstLine.Trim();
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
