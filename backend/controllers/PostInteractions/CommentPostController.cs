using BlogApi.DTOs;
using BlogApi.Interfaces.PostInteractions;
using BlogApi.Services.PostInteractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.PostInteractions;

[ApiController]
[Route("api/posts/{postId:int}/comments")]
public class CommentPostController : BaseController
{
    private readonly ICommentPostService _commentPostService;

    public CommentPostController(ICommentPostService commentPostService)
    {
        _commentPostService = commentPostService;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<CommentDto>> AddComment(int postId, AddCommentRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var comment = await _commentPostService.AddCommentAsync(userId.Value, postId, request);
            return CreatedAtAction("GetPost", "ViewPost", new { id = postId }, comment);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
