using BlogApi.Interfaces.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Chat;

[ApiController]
[Route("api/chat/messages/{messageId}")]
[Authorize]
public class DeleteMessageController : BaseController
{
    private readonly IChatService _chatService;

    public DeleteMessageController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpDelete]
    public async Task<ActionResult> DeleteMessage(int messageId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            _ = await _chatService.DeleteMessageAsync(userId.Value, messageId);
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
