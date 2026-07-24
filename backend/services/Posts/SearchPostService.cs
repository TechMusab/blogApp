using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using BlogApi.Mappers;
using BlogApi.Repositories;

public class SearchPostService : ISearchPostService
{
    private readonly IPostRepository _postRepository;

    public SearchPostService(IPostRepository postRepository)
    {
        _postRepository = postRepository;
    }

    public async Task<IEnumerable<PostDto>> SearchPostsAsync(string query)
    {
        var posts = await _postRepository.SearchAsync(query);
        return posts.Select(PostMapper.ToPostDto);
    }
}
