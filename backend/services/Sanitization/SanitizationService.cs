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

        // Remove potentially dangerous SQL injection patterns
        var sanitized = input
            .Replace("--", string.Empty)
            .Replace("/*", string.Empty)
            .Replace("*/", string.Empty)
            .Replace("xp_", string.Empty)
            .Replace("sp_", string.Empty)
            .Replace("exec", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("execute", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("drop", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("delete", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("truncate", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("insert", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("update", string.Empty, StringComparison.OrdinalIgnoreCase);

        // Remove script tags and event handlers
        sanitized = System.Text.RegularExpressions.Regex.Replace(
            sanitized,
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
