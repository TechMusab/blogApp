using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using BlogApi.Mappers;
using BlogApi.Repositories;

public class YourPostsService : IYourPostsService
{
    private readonly IPostRepository _postRepository;

    public YourPostsService(IPostRepository postRepository)
    {
        _postRepository = postRepository;
    }

    public async Task<IEnumerable<PostDto>> GetUserPostsAsync(int userId)
    {
        var posts = await _postRepository.GetByAuthorIdWithIncludesAsync(userId);
        return posts.Select(PostMapper.ToPostDto);
    }
}
