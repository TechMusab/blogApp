using System.Net;
using System.Text.Json;

namespace BlogApi.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip exception handling for CORS preflight requests
        if (context.Request.Method == "OPTIONS")
        {
            _logger.LogInformation("ExceptionHandlingMiddleware: Skipping OPTIONS request");
            await _next(context);
            return;
        }

        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var environment = context.RequestServices.GetRequiredService<IWebHostEnvironment>();
        
        // Log detailed error information server-side
        _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = new ErrorResponse
        {
            Message = environment.IsDevelopment() ? exception.Message : "An error occurred processing your request.",
            StatusCode = (int)HttpStatusCode.InternalServerError
        };

        switch (exception)
        {
            case UnauthorizedAccessException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse.Message = environment.IsDevelopment() ? exception.Message : "Authentication failed.";
                break;
            case InvalidOperationException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                // Keep InvalidOperationException messages as they're typically user-facing validation errors
                break;
            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                // Generic error message in production to prevent information disclosure
                if (!environment.IsDevelopment())
                {
                    errorResponse.Message = "An internal server error occurred. Please try again later.";
                }
                break;
        }

        var json = JsonSerializer.Serialize(errorResponse);
        await response.WriteAsync(json);
    }

    private class ErrorResponse
    {
        public string Message { get; set; } = string.Empty;
        public int StatusCode { get; set; }
    }
}
