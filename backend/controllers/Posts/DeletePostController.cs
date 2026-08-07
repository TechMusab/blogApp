using BlogApi.Interfaces.Posts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Posts;

[ApiController]
[Route("api/posts")]
[EnableCors("ReactApp")]
public class DeletePostController : BaseController
{
    private readonly IDeletePostService _deletePostService;

    public DeletePostController(IDeletePostService deletePostService)
    {
        _deletePostService = deletePostService;
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePost(int id)
    {
        var userId = GetCurrentUserId();
        
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            await _deletePostService.DeletePostAsync(id, userId.Value);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}
