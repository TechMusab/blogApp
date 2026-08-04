using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Posts;

[ApiController]
[Route("api/posts")]
[EnableCors("ReactApp")]
public class ViewPostController : BaseController
{
    private readonly IViewPostService _viewPostService;

    public ViewPostController(IViewPostService viewPostService)
    {
        _viewPostService = viewPostService;
    }

    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<PostDto>> GetPost(int id)
    {
        var userId = GetCurrentUserId();
        var post = await _viewPostService.GetPostByIdAsync(id, userId);
        return post is null ? NotFound() : Ok(post);
    }
}
