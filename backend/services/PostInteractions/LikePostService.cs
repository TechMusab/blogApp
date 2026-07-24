using BlogApi.DTOs;
using BlogApi.Interfaces.PostInteractions;
using BlogApi.Models;
using BlogApi.Repositories;

namespace BlogApi.Services.PostInteractions;

public class LikePostService : ILikePostService
{
    private readonly IPostRepository _postRepository;
    private readonly IPostLikeRepository _postLikeRepository;

    public LikePostService(IPostRepository postRepository, IPostLikeRepository postLikeRepository)
    {
        _postRepository = postRepository;
        _postLikeRepository = postLikeRepository;
    }

    public async Task<ToggleResponse> ToggleLikeAsync(int userId, int postId)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        if (post is null)
        {
            throw new InvalidOperationException("Post not found.");
        }

        var like = await _postLikeRepository.FindAsync(userId, postId);
        var active = like is null;

        if (like is null)
        {
            await _postLikeRepository.AddAsync(new PostLike { UserId = userId, PostId = postId });
        }
        else
        {
            await _postLikeRepository.RemoveAsync(like);
        }

        await _postLikeRepository.SaveChangesAsync();
        return new ToggleResponse { Active = active };
    }
}
