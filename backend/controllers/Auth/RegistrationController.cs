using BlogApi.DTOs;
using BlogApi.Interfaces.Auth;
using BlogApi.Services.Auth;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Auth;

[ApiController]
[Route("api/auth/register")]
public class RegistrationController : BaseController
{
    private readonly IRegistrationService _registrationService;

    public RegistrationController(IRegistrationService registrationService)
    {
        _registrationService = registrationService;
    }

    [HttpPost]
    public async Task<ActionResult<OtpChallengeResponse>> Register(RegisterRequest request)
    {
        try
        {
            var result = await _registrationService.RegisterAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("verify")]
    public async Task<ActionResult<AuthResponse>> VerifyRegistration(VerifyRegistrationRequest request)
    {
        try
        {
            var result = await _registrationService.VerifyRegistrationAsync(request);
            return CreatedAtAction("Me", "Users", result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

[ApiController]
[Route("api/auth/verify-registration")]
public class VerifyRegistrationController : BaseController
{
    private readonly IRegistrationService _registrationService;

    public VerifyRegistrationController(IRegistrationService registrationService)
    {
        _registrationService = registrationService;
    }

    [HttpPost]
    public async Task<ActionResult<AuthResponse>> Verify(VerifyRegistrationRequest request)
    {
        try
        {
            var result = await _registrationService.VerifyRegistrationAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
