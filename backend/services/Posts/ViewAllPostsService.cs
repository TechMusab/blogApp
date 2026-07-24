using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using BlogApi.Mappers;
using BlogApi.Repositories;

public class ViewAllPostsService : IViewAllPostsService
{
    private readonly IPostRepository _postRepository;

    public ViewAllPostsService(IPostRepository postRepository)
    {
        _postRepository = postRepository;
    }

    public async Task<IEnumerable<PostDto>> GetAllPostsAsync()
    {
        var posts = await _postRepository.GetAllWithIncludesAsync();
        return posts.Select(PostMapper.ToPostDto);
    }

    public async Task<PagedResult<PostDto>> GetAllPostsPagedAsync(int pageNumber, int pageSize)
    {
        var pagedPosts = await _postRepository.GetAllWithIncludesPagedAsync(pageNumber, pageSize);
        return new PagedResult<PostDto>
        {
            Items = pagedPosts.Items.Select(PostMapper.ToPostDto),
            TotalCount = pagedPosts.TotalCount,
            PageNumber = pagedPosts.PageNumber,
            PageSize = pagedPosts.PageSize
        };
    }
}
