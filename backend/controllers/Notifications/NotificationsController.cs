using BlogApi.DTOs;
using BlogApi.Interfaces.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Notifications;

[ApiController]
[Route("api/notifications")]
[EnableCors("ReactApp")]
public class NotificationsController : BaseController
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<PagedResult<NotificationDto>>> GetUserNotifications([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _notificationService.GetUserNotificationsAsync(userId.Value, pageNumber, pageSize);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("unread-count")]
    public async Task<ActionResult<UnreadCountResponse>> GetUnreadCount()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _notificationService.GetUnreadCountAsync(userId.Value);
        return Ok(result);
    }

    [Authorize]
    [HttpPatch("{id}/read")]
    public async Task<ActionResult<MarkAsReadResponse>> MarkAsRead(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _notificationService.MarkAsReadAsync(userId.Value, id);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [Authorize]
    [HttpPatch("read-all")]
    public async Task<ActionResult<MarkAsReadResponse>> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _notificationService.MarkAllAsReadAsync(userId.Value);
        return Ok(result);
    }
}
