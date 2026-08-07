using BlogApi.DTOs;
using BlogApi.Interfaces.PostInteractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.PostInteractions;

[ApiController]
[Route("api/posts/{postId:int}/comments/{commentId:int}")]
[EnableCors("ReactApp")]
public class UpdateCommentController : BaseController
{
    private readonly IUpdateCommentService _updateCommentService;

    public UpdateCommentController(IUpdateCommentService updateCommentService)
    {
        _updateCommentService = updateCommentService;
    }

    [Authorize]
    [HttpPatch]
    public async Task<ActionResult<CommentDto>> UpdateComment(int postId, int commentId, UpdateCommentRequest request)
    {
        var userId = GetCurrentUserId();
        
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var comment = await _updateCommentService.UpdateCommentAsync(commentId, userId.Value, request);
            return Ok(comment);
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
