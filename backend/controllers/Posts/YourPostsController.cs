using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using BlogApi.Services.Posts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Posts;

[ApiController]
[Route("api/posts/your-posts")]
public class YourPostsController : BaseController
{
    private readonly IYourPostsService _yourPostsService;

    public YourPostsController(IYourPostsService yourPostsService)
    {
        _yourPostsService = yourPostsService;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetUserPosts()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var posts = await _yourPostsService.GetUserPostsAsync(userId.Value);
        return Ok(posts);
    }
}
