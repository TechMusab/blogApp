namespace BlogApi.Services.Sanitization;

public interface ISanitizationService
{
    string SanitizeHtml(string input);
    string SanitizeInput(string input);
    string[] SanitizeArray(string[] inputs);
}

public class SanitizationService : ISanitizationService
{
    public string SanitizeHtml(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        // Remove script tags and their content
        var sanitized = System.Text.RegularExpressions.Regex.Replace(
            input,
            @"<script\b[^>]*>(.*?)</script>",
            string.Empty,
            System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Singleline);

        // Remove dangerous HTML tags
        sanitized = System.Text.RegularExpressions.Regex.Replace(
            sanitized,
            @"<(/?(?:iframe|object|embed|script|style|meta|link|form|input|button)[^>]*)>",
            string.Empty,
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        // Remove event handlers
        sanitized = System.Text.RegularExpressions.Regex.Replace(
            sanitized,
            @"\s*on\w+\s*=\s*[""'][^""']*[""']",
            string.Empty,
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        // Remove javascript: protocol
        sanitized = System.Text.RegularExpressions.Regex.Replace(
            sanitized,
            @"javascript:\s*\S*",
            string.Empty,
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        return sanitized.Trim();
    }

    public string SanitizeInput(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        // Note: SQL injection is handled by Entity Framework's parameterized queries
        // No need to filter SQL keywords - they're harmless in user content

        // Remove script tags and event handlers for XSS prevention
        var sanitized = System.Text.RegularExpressions.Regex.Replace(
            input,
            @"<script\b[^>]*>(.*?)</script>",
            string.Empty,
            System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Singleline);

        sanitized = System.Text.RegularExpressions.Regex.Replace(
            sanitized,
            @"on\w+\s*=",
            string.Empty,
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        return sanitized.Trim();
    }

    public string[] SanitizeArray(string[] inputs)
    {
        if (inputs == null || inputs.Length == 0)
            return Array.Empty<string>();

        return inputs.Select(SanitizeInput).ToArray();
    }
}
