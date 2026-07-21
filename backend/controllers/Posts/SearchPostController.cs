using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using BlogApi.Services.Posts;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Posts;

[ApiController]
[Route("api/posts/search")]
public class SearchPostController : BaseController
{
    private readonly ISearchPostService _searchPostService;

    public SearchPostController(ISearchPostService searchPostService)
    {
        _searchPostService = searchPostService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PostDto>>> SearchPosts([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return BadRequest(new { message = "Search query is required." });
        }

        var posts = await _searchPostService.SearchPostsAsync(q);
        return Ok(posts);
    }
}
