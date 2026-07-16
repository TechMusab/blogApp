using System.ComponentModel.DataAnnotations;

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
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Excerpt { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? CoverImage { get; set; }

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    public string[]? Tags { get; set; }

    public bool Featured { get; set; }

    public string? Quote { get; set; }

    public string[]? Paragraphs { get; set; }
}

public class AddCommentRequest
{
    [Required]
    [MaxLength(2000)]
    public string Text { get; set; } = string.Empty;
}

public class ToggleResponse
{
    public bool Active { get; set; }
}
