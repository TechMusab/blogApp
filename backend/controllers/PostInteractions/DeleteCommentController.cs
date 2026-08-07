using BlogApi.Interfaces.PostInteractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.PostInteractions;

[ApiController]
[Route("api/posts/{postId:int}/comments/{commentId:int}")]
[EnableCors("ReactApp")]
public class DeleteCommentController : BaseController
{
    private readonly IDeleteCommentService _deleteCommentService;

    public DeleteCommentController(IDeleteCommentService deleteCommentService)
    {
        _deleteCommentService = deleteCommentService;
    }

    [Authorize]
    [HttpDelete]
    public async Task<ActionResult> DeleteComment(int postId, int commentId)
    {
        var userId = GetCurrentUserId();
        
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            await _deleteCommentService.DeleteCommentAsync(commentId, userId.Value);
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
