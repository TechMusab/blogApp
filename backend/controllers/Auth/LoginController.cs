using BlogApi.DTOs;
using BlogApi.Interfaces.Auth;
using BlogApi.Services.Auth;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Auth;

[ApiController]
[Route("api/auth/[controller]")]
public class LoginController : BaseController
{
    private readonly ILoginService _loginService;

    public LoginController(ILoginService loginService)
    {
        _loginService = loginService;
    }

    [HttpPost]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        try
        {
            var result = await _loginService.LoginAsync(request);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}
