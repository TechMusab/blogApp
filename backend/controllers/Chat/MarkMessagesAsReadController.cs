using BlogApi.Interfaces.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Chat;

[ApiController]
[Route("api/chat/conversations/{conversationId}/read")]
[Authorize]
public class MarkMessagesAsReadController : BaseController
{
    private readonly IChatService _chatService;

    public MarkMessagesAsReadController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost]
    public async Task<ActionResult> MarkMessagesAsRead(int conversationId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            await _chatService.MarkMessagesAsReadAsync(userId.Value, conversationId);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }
}
