using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Posts;

[ApiController]
[Route("api/posts")]
public class CreatePostController : BaseController
{
    private readonly ICreatePostService _createPostService;

    public CreatePostController(ICreatePostService createPostService)
    {
        _createPostService = createPostService;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<PostDto>> CreatePost(CreatePostRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var post = await _createPostService.CreatePostAsync(userId.Value, request);
            return CreatedAtAction("GetPost", "ViewPost", new { id = post.Id }, post);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
