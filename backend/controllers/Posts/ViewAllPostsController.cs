using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Posts;

[ApiController]
[Route("api/posts")]
[EnableCors("ReactApp")]
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
        var userId = GetCurrentUserId();
        var posts = await _viewAllPostsService.GetAllPostsPagedAsync(pageNumber, pageSize, userId);
        return Ok(posts);
    }
}
