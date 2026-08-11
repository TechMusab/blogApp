using BlogApi.DTOs;
using BlogApi.Interfaces.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Chat;

[ApiController]
[Route("api/chat/conversations/{conversationId}/messages")]
[Authorize]
public class GetMessagesController : BaseController
{
    private readonly IChatService _chatService;

    public GetMessagesController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedMessagesResponse>> GetMessages(int conversationId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 30)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            var messages = await _chatService.GetConversationMessagesAsync(userId.Value, conversationId, pageNumber, pageSize);
            return Ok(messages);
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
