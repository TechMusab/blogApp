using BlogApi.Models;

namespace BlogApi.Repositories;

public interface IPostRepository
{
    Task<Post?> GetByIdAsync(int id);
    Task<IEnumerable<Post>> GetAllAsync();
    Task<IEnumerable<Post>> GetByAuthorIdAsync(int authorId);
    Task AddAsync(Post post);
    Task UpdateAsync(Post post);
    Task DeleteAsync(Post post);
    Task SaveChangesAsync();
}
