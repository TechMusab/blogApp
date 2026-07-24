using BlogApi.Models;

namespace BlogApi.Repositories;

public interface IPostLikeRepository
{
    Task<PostLike?> FindAsync(int userId, int postId);
    Task AddAsync(PostLike postLike);
    Task RemoveAsync(PostLike postLike);
    Task SaveChangesAsync();
}
