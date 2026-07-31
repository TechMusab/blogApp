namespace BlogApi.Helpers;

public static class ConfigurationHelper
{
    public static string GetRequiredConfigurationValue(this IConfiguration configuration, string key)
    {
        return configuration[key] ?? throw new InvalidOperationException($"{key} is not configured.");
    }

    public static string GetRequiredConfigurationValue(this IConfiguration configuration, string key, string errorMessage)
    {
        return configuration[key] ?? throw new InvalidOperationException(errorMessage);
    }
}
