using BlogApi.DTOs;
using BlogApi.Models;

namespace BlogApi.Repositories;

public interface IPostRepository
{
    Task<Post?> GetByIdAsync(int id);
    Task<Post?> GetByIdWithIncludesAsync(int id);
    Task<IEnumerable<Post>> GetAllAsync();
    Task<IEnumerable<Post>> GetAllWithIncludesAsync();
    Task<PagedResult<Post>> GetAllWithIncludesPagedAsync(int pageNumber, int pageSize);
    Task<IEnumerable<Post>> GetByAuthorIdAsync(int authorId);
    Task<IEnumerable<Post>> GetByAuthorIdWithIncludesAsync(int authorId);
    Task<IEnumerable<Post>> SearchAsync(string query);
    Task AddAsync(Post post);
    Task UpdateAsync(Post post);
    Task DeleteAsync(Post post);
    Task SaveChangesAsync();
}
