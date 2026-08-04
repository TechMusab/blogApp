using BlogApi.DTOs;
using BlogApi.Interfaces.Auth;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Auth;

[ApiController]
[Route("api/auth/[controller]")]
[EnableCors("ReactApp")]
public class GoogleAuthController : BaseController
{
    private readonly IGoogleAuthService _googleAuthService;

    public GoogleAuthController(IGoogleAuthService googleAuthService)
    {
        _googleAuthService = googleAuthService;
    }

    [HttpPost]
    public async Task<ActionResult<AuthResponse>> GoogleLogin(GoogleAuthRequest request)
    {
        try
        {
            var result = await _googleAuthService.AuthenticateWithGoogleAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
