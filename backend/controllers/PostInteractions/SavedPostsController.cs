using BlogApi.DTOs;
using BlogApi.Interfaces.PostInteractions;
using BlogApi.Services.PostInteractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.PostInteractions;

[ApiController]
[Route("api/posts/saved")]
public class SavedPostsController : BaseController
{
    private readonly ISavedPostsService _savedPostsService;

    public SavedPostsController(ISavedPostsService savedPostsService)
    {
        _savedPostsService = savedPostsService;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<string>>> GetSavedPostIds()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var savedIds = await _savedPostsService.GetSavedPostIdsAsync(userId.Value);
        return Ok(savedIds);
    }

    [Authorize]
    [HttpPost("{id:int}")]
    public async Task<ActionResult<ToggleResponse>> ToggleSaved(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var result = await _savedPostsService.ToggleSavedAsync(userId.Value, id);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete]
    public async Task<IActionResult> ClearSavedPosts()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        await _savedPostsService.ClearSavedPostsAsync(userId.Value);
        return NoContent();
    }
}

[ApiController]
[Route("api/posts/{postId:int}/save")]
public class ToggleSavedController : BaseController
{
    private readonly ISavedPostsService _savedPostsService;

    public ToggleSavedController(ISavedPostsService savedPostsService)
    {
        _savedPostsService = savedPostsService;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ToggleResponse>> ToggleSaved(int postId)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var result = await _savedPostsService.ToggleSavedAsync(userId.Value, postId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
