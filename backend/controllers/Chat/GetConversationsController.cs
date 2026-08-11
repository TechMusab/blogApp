using BlogApi.DTOs;
using BlogApi.Interfaces.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Chat;

[ApiController]
[Route("api/chat/conversations")]
[Authorize]
public class GetConversationsController : BaseController
{
    private readonly IChatService _chatService;

    public GetConversationsController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ConversationDto>>> GetConversations()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            var conversations = await _chatService.GetConversationsAsync(userId.Value);
            return Ok(conversations);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
