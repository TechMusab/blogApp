namespace BlogApi.Configuration;

public interface IImageStorageConfiguration
{
    string BasePath { get; }
    string BaseUrl { get; }
    long MaxFileSize { get; }
    string[] AllowedExtensions { get; }
}

public class ImageStorageConfiguration : IImageStorageConfiguration
{
    private readonly IConfiguration _configuration;

    public ImageStorageConfiguration(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string BasePath => _configuration["ImageStorage:BasePath"] ?? "wwwroot/uploads";
    public string BaseUrl => _configuration["ImageStorage:BaseUrl"] ?? "/uploads";
    public long MaxFileSize => _configuration.GetValue<long>("ImageStorage:MaxFileSize", 5 * 1024 * 1024); // 5MB default
    public string[] AllowedExtensions => _configuration.GetSection("ImageStorage:AllowedExtensions").Get<string[]>() 
        ?? new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
}
