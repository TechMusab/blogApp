using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using BlogApi.Services.Posts;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Posts;

[ApiController]
[Route("api/posts")]
public class ViewAllPostsController : BaseController
{
    private readonly IViewAllPostsService _viewAllPostsService;

    public ViewAllPostsController(IViewAllPostsService viewAllPostsService)
    {
        _viewAllPostsService = viewAllPostsService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetAllPosts()
    {
        var posts = await _viewAllPostsService.GetAllPostsAsync();
        return Ok(posts);
    }
}
