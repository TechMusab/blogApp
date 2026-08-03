using System.Diagnostics;

namespace BlogApi.Middleware;

public class LoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LoggingMiddleware> _logger;

    public LoggingMiddleware(RequestDelegate next, ILogger<LoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var request = context.Request;
        var environment = context.RequestServices.GetRequiredService<IWebHostEnvironment>();

        // Detailed CORS logging only in development
        if (environment.IsDevelopment() && request.Method == "OPTIONS")
        {
            _logger.LogInformation("=== CORS PREFLIGHT REQUEST ===");
            _logger.LogInformation("Method: {Method}", request.Method);
            _logger.LogInformation("Path: {Path}", request.Path);
            _logger.LogInformation("Origin: {Origin}", request.Headers["Origin"].ToString());
            _logger.LogInformation("Access-Control-Request-Method: {Method}", request.Headers["Access-Control-Request-Method"].ToString());
            _logger.LogInformation("Access-Control-Request-Headers: {Headers}", request.Headers["Access-Control-Request-Headers"].ToString());
        }
        else
        {
            _logger.LogInformation("Incoming request: {Method} {Path}", request.Method, request.Path);
        }

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            var response = context.Response;

            // Log CORS headers for OPTIONS requests only in development
            if (environment.IsDevelopment() && request.Method == "OPTIONS")
            {
                _logger.LogInformation("=== CORS PREFLIGHT RESPONSE ===");
                _logger.LogInformation("Status: {StatusCode}", response.StatusCode);
                _logger.LogInformation("Access-Control-Allow-Origin: {Origin}", response.Headers["Access-Control-Allow-Origin"].ToString());
                _logger.LogInformation("Access-Control-Allow-Methods: {Methods}", response.Headers["Access-Control-Allow-Methods"].ToString());
                _logger.LogInformation("Access-Control-Allow-Headers: {Headers}", response.Headers["Access-Control-Allow-Headers"].ToString());
                _logger.LogInformation("Access-Control-Allow-Credentials: {Credentials}", response.Headers["Access-Control-Allow-Credentials"].ToString());
            }
            else
            {
                _logger.LogInformation(
                    "Outgoing response: {Method} {Path} - Status: {StatusCode} - Duration: {ElapsedMs}ms",
                    request.Method,
                    request.Path,
                    response.StatusCode,
                    stopwatch.ElapsedMilliseconds);
            }
        }
    }
}
