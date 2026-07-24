using BlogApi.Models;

namespace BlogApi.Repositories;

public interface ICommentRepository
{
    Task<Comment?> GetByIdAsync(int id);
    Task<Comment?> GetByIdWithUserAsync(int id);
    Task AddAsync(Comment comment);
    Task SaveChangesAsync();
}
