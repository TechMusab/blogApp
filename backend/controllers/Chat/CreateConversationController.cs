using BlogApi.DTOs;
using BlogApi.Interfaces.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Chat;

[ApiController]
[Route("api/chat/conversations")]
[Authorize]
public class CreateConversationController : BaseController
{
    private readonly IChatService _chatService;

    public CreateConversationController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost]
    public async Task<ActionResult<ConversationDto>> CreateConversation([FromBody] CreateConversationRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            var conversation = await _chatService.GetOrCreateConversationAsync(userId.Value, request.UserId);
            return Ok(conversation);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }
}
