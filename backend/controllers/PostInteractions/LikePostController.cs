using BlogApi.DTOs;
using BlogApi.Interfaces.PostInteractions;
using BlogApi.Services.PostInteractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.PostInteractions;

[ApiController]
[Route("api/posts/{postId:int}/like")]
public class LikePostController : BaseController
{
    private readonly ILikePostService _likePostService;

    public LikePostController(ILikePostService likePostService)
    {
        _likePostService = likePostService;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ToggleResponse>> ToggleLike(int postId)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var result = await _likePostService.ToggleLikeAsync(userId.Value, postId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
