using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Posts;

[ApiController]
[Route("api/posts")]
public class ViewPostController : BaseController
{
    private readonly IViewPostService _viewPostService;

    public ViewPostController(IViewPostService viewPostService)
    {
        _viewPostService = viewPostService;
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PostDto>> GetPost(int id)
    {
        var post = await _viewPostService.GetPostByIdAsync(id);
        return post is null ? NotFound() : Ok(post);
    }
}
