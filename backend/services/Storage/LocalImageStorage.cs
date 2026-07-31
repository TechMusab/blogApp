using BlogApi.Interfaces.Storage;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

namespace BlogApi.Services.Storage;

public class LocalImageStorage : IImageStorage
{
    private readonly string _basePath;
    private readonly string _baseUrl;
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private readonly string[] _allowedMimeTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
    private const int MaxAvatarSize = 30; // Maximum avatar size in pixels
    private const int MaxPostImageSize = 800; // Maximum post image size in pixels

    public LocalImageStorage(IConfiguration configuration)
    {
        _basePath = configuration["ImageStorage:BasePath"] ?? "wwwroot/uploads";
        _baseUrl = configuration["ImageStorage:BaseUrl"] ?? "/uploads";

        // Ensure base directory exists
        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    public async Task<string> UploadAsync(IFormFile file, string folder)
    {
        if (!IsValidImage(file))
        {
            throw new InvalidOperationException("Invalid image file or file too large.");
        }

        var uniqueFileName = GenerateUniqueFileName(file.FileName);
        var folderPath = Path.Combine(_basePath, folder);
        var filePath = Path.Combine(folderPath, uniqueFileName);

        // Ensure folder exists
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        // Resize image before saving
        byte[] resizedImageBytes;
        using (var imageStream = file.OpenReadStream())
        {
            var targetSize = folder == "avatars" ? MaxAvatarSize : MaxPostImageSize;
            resizedImageBytes = await ResizeImageAsync(imageStream, targetSize);
        }

        await File.WriteAllBytesAsync(filePath, resizedImageBytes);

        return Path.Combine(_baseUrl, folder, uniqueFileName).Replace("\\", "/");
    }

    public async Task<string> UploadAsync(byte[] data, string fileName, string folder)
    {
        var uniqueFileName = GenerateUniqueFileName(fileName);
        var folderPath = Path.Combine(_basePath, folder);
        var filePath = Path.Combine(folderPath, uniqueFileName);

        // Ensure folder exists
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        await File.WriteAllBytesAsync(filePath, data);

        return Path.Combine(_baseUrl, folder, uniqueFileName).Replace("\\", "/");
    }

    public Task DeleteAsync(string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl))
        {
            return Task.CompletedTask;
        }

        // Extract relative path from URL
        var relativePath = imageUrl.Replace(_baseUrl, "").Trim('/');
        var filePath = Path.Combine(_basePath, relativePath.Replace('/', '\\'));

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        return Task.CompletedTask;
    }

    public string GetUrl(string imagePath)
    {
        if (string.IsNullOrEmpty(imagePath))
        {
            return string.Empty;
        }

        // If it's already a full URL, return as is
        if (imagePath.StartsWith("http://") || imagePath.StartsWith("https://"))
        {
            return imagePath;
        }

        // If it's a relative path, ensure it starts with base URL
        if (!imagePath.StartsWith(_baseUrl))
        {
            return Path.Combine(_baseUrl, imagePath.Trim('/')).Replace("\\", "/");
        }

        return imagePath.Replace("\\", "/");
    }

    public string GenerateUniqueFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
        var guid = Guid.NewGuid().ToString("N");
        return $"{guid}{extension}";
    }

    private async Task<byte[]> ResizeImageAsync(Stream imageStream, int maxSize)
    {
        using var image = Image.FromStream(imageStream);

        // Calculate new dimensions maintaining aspect ratio
        int newWidth, newHeight;
        if (image.Width > image.Height)
        {
            newWidth = maxSize;
            newHeight = (int)(image.Height * ((float)maxSize / image.Width));
        }
        else
        {
            newHeight = maxSize;
            newWidth = (int)(image.Width * ((float)maxSize / image.Height));
        }

        using var resizedImage = new Bitmap(newWidth, newHeight);
        using (var graphics = Graphics.FromImage(resizedImage))
        {
            graphics.CompositingMode = CompositingMode.SourceCopy;
            graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
            graphics.SmoothingMode = SmoothingMode.AntiAlias;
            graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
            graphics.DrawImage(image, 0, 0, newWidth, newHeight);
        }

        using var memoryStream = new MemoryStream();
        resizedImage.Save(memoryStream, ImageFormat.Png);
        return memoryStream.ToArray();
    }

    public bool IsValidImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return false;
        }

        // Check file size
        if (file.Length > MaxFileSize)
        {
            return false;
        }

        // Check file extension
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
        {
            return false;
        }

        // Check MIME type
        if (!_allowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
        {
            return false;
        }

        return true;
    }
}
