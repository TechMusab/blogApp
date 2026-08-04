using BlogApi.DTOs;
using BlogApi.Interfaces.Posts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Posts;

[ApiController]
[Route("api/posts")]
[EnableCors("ReactApp")]
public class UpdatePostController : BaseController
{
    private readonly IUpdatePostService _updatePostService;

    public UpdatePostController(IUpdatePostService updatePostService)
    {
        _updatePostService = updatePostService;
    }

    [Authorize]
    [HttpPatch("{id}")]
    public async Task<ActionResult<PostDto>> UpdatePost(int id, UpdatePostRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var post = await _updatePostService.UpdatePostAsync(id, userId.Value, request);
            return Ok(post);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
