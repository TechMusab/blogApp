using BlogApi.DTOs;

namespace BlogApi.Interfaces.PostInteractions;

public interface ISavedPostsService
{
    Task<IEnumerable<string>> GetSavedPostIdsAsync(int userId);
    Task<ToggleResponse> ToggleSavedAsync(int userId, int postId);
    Task ClearSavedPostsAsync(int userId);
}
