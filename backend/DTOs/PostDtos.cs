using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace BlogApi.DTOs;

public class PostDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string CoverImage { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string[]? Tags { get; set; }
    public string AuthorId { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string ReadTime { get; set; } = string.Empty;
    public int Likes { get; set; }
    public string[] LikedBy { get; set; } = Array.Empty<string>();
    public int Comments { get; set; }
    public bool Featured { get; set; }
    public string? Quote { get; set; }
    public string[]? Paragraphs { get; set; }
    public CommentDto[] CommentsList { get; set; } = Array.Empty<CommentDto>();
}

public class CommentDto
{
    public string Id { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
}

public class CreatePostRequest
{
    [Required]
    [MaxLength(220)]
    [RegularExpression(@"^[a-zA-Z0-9\s.,!?@:()""'-]*$", ErrorMessage = "Title contains invalid characters.")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    [RegularExpression(@"^[a-zA-Z0-9\s.,!?@:()""'-]*$", ErrorMessage = "Excerpt contains invalid characters.")]
    public string? Excerpt { get; set; }

    [Required]
    [RegularExpression(@"^[a-zA-Z0-9\s.,!?@:()""'-]*$", ErrorMessage = "Content contains invalid characters.")]
    public string Content { get; set; } = string.Empty;

    [MaxLength(1000)]
    [RegularExpression(@"^https?:\/\/[^\s""<>{};\\]*$", ErrorMessage = "CoverImage must be a valid URL.")]
    public string? CoverImage { get; set; }

    [Required]
    [MaxLength(100)]
    [RegularExpression(@"^[a-zA-Z\s-]*$", ErrorMessage = "Category can only contain letters, spaces, and hyphens.")]
    public string Category { get; set; } = string.Empty;

    [RegularExpression(@"^[a-zA-Z0-9\s,-]*$", ErrorMessage = "Tags can only contain letters, numbers, spaces, commas, and hyphens.")]
    public string[]? Tags { get; set; }

    public bool Featured { get; set; }

    [RegularExpression(@"^[a-zA-Z0-9\s.,!?@:()""'-]*$", ErrorMessage = "Quote contains invalid characters.")]
    public string? Quote { get; set; }

    public string[]? Paragraphs { get; set; }
}

public class AddCommentRequest
{
    [Required]
    [MaxLength(2000)]
    [RegularExpression(@"^[a-zA-Z0-9\s.,!?@:()""'-]*$", ErrorMessage = "Comment contains invalid characters.")]
    public string Text { get; set; } = string.Empty;
}

public class ToggleResponse
{
    public bool Active { get; set; }
}
