using BlogApi.DTOs;
using BlogApi.Models;

namespace BlogApi.Mappers;

public static class PostMapper
{
    public static PostDto ToPostDto(Post post)
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
            Avatar = post.User.Avatar ?? BuildAvatar(post.User.Name),
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

    public static CommentDto ToCommentDto(Comment comment)
    {
        return new CommentDto
        {
            Id = comment.Id.ToString(),
            Author = comment.User.Name,
            Avatar = comment.User.Avatar ?? BuildAvatar(comment.User.Name),
            Text = comment.Content,
            Date = comment.CreatedAt.ToString("MMM d, yyyy")
        };
    }

    public static string[]? DeserializeOptional(string? json)
    {
        return string.IsNullOrWhiteSpace(json) ? null : System.Text.Json.JsonSerializer.Deserialize<string[]>(json);
    }

    public static string? SerializeOptional(string[]? values)
    {
        var cleaned = values?.Where(value => !string.IsNullOrWhiteSpace(value)).Select(value => value.Trim()).ToArray();
        return cleaned is { Length: > 0 } ? System.Text.Json.JsonSerializer.Serialize(cleaned) : null;
    }

    public static string BuildAvatar(string name)
    {
        var avatar = string.Concat(name
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Take(2)
            .Select(part => part[0].ToString().ToUpperInvariant()));

        return string.IsNullOrWhiteSpace(avatar) ? "U" : avatar;
    }
}
