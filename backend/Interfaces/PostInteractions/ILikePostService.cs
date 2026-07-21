using BlogApi.DTOs;

namespace BlogApi.Interfaces.PostInteractions;

public interface ILikePostService
{
    Task<ToggleResponse> ToggleLikeAsync(int userId, int postId);
}
