using BlogApi.DTOs;
using BlogApi.Interfaces.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Chat;

[ApiController]
[Route("api/chat/conversations/{conversationId}/messages")]
[Authorize]
public class SendMessageController : BaseController
{
    private readonly IChatService _chatService;

    public SendMessageController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost]
    public async Task<ActionResult<MessageDto>> SendMessage(int conversationId, [FromBody] SendMessageRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            var message = await _chatService.SendMessageAsync(userId.Value, conversationId, request.Content);
            return Ok(message);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
