namespace BlogApi.Helpers;

public static class ExceptionsHelper
{
    public static void ThrowIfNotFound<T>(T? entity, string errorMessage = "Resource not found.")
    {
        if (entity == null)
        {
            throw new InvalidOperationException(errorMessage);
        }
    }

    public static void ThrowIfNotFound(bool exists, string errorMessage = "Resource not found.")
    {
        if (!exists)
        {
            throw new InvalidOperationException(errorMessage);
        }
    }
}
