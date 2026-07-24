using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using BlogApi.Mappers;
using BlogApi.Repositories;

public class ViewPostService : IViewPostService
{
    private readonly IPostRepository _postRepository;

    public ViewPostService(IPostRepository postRepository)
    {
        _postRepository = postRepository;
    }

    public async Task<PostDto?> GetPostByIdAsync(int id)
    {
        var post = await _postRepository.GetByIdWithIncludesAsync(id);
        return post is null ? null : PostMapper.ToPostDto(post);
    }
}
