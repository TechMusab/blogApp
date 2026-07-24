using BlogApi.Models;

namespace BlogApi.Repositories;

public interface ISavedPostRepository
{
    Task<IEnumerable<string>> GetSavedPostIdsAsync(int userId);
    Task<SavedPost?> FindAsync(int userId, int postId);
    Task AddAsync(SavedPost savedPost);
    Task RemoveAsync(SavedPost savedPost);
    Task<IEnumerable<SavedPost>> GetByUserIdAsync(int userId);
    Task RemoveRangeAsync(IEnumerable<SavedPost> savedPosts);
    Task SaveChangesAsync();
}
