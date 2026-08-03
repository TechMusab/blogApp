namespace BlogApi.Configuration;

public class ResendOptions
{
    public const string SectionName = "Resend";
    
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "Blog App";
}

public class ResendClientOptions
{
    public string ApiKey { get; set; } = string.Empty;
}
