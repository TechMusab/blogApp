using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
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
    public async Task<ActionResult<PagedResult<PostDto>>> GetAllPosts([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var posts = await _viewAllPostsService.GetAllPostsPagedAsync(pageNumber, pageSize);
        return Ok(posts);
    }
}
