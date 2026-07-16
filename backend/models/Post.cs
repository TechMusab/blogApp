namespace BlogApi.Models;

public class Post
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public string Excerpt { get; set; } = string.Empty;

    public string CoverImage { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string ReadTime { get; set; } = string.Empty;

    public bool Featured { get; set; }

    public string? Quote { get; set; }

    public string? TagsJson { get; set; }

    public string? ParagraphsJson { get; set; }

    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Foreign Key
    public int UserId { get; set; }

    // Navigation Property
    public User User { get; set; } = null!;

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public ICollection<PostLike> Likes { get; set; } = new List<PostLike>();

    public ICollection<SavedPost> SavedByUsers { get; set; } = new List<SavedPost>();
}
