using BlogApi.Interfaces.Storage;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace BlogApi.Services.Storage;

public class CloudinaryImageStorage : IImageStorage
{
    private readonly Cloudinary _cloudinary;
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private readonly string[] _allowedMimeTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
    private const int MaxAvatarSize = 30; // Maximum avatar size in pixels
    private const int MaxPostImageSize = 800; // Maximum post image size in pixels

    public CloudinaryImageStorage(IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
        {
            throw new InvalidOperationException("Cloudinary configuration is missing. Please set Cloudinary:CloudName, Cloudinary:ApiKey, and Cloudinary:ApiSecret in configuration.");
        }

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadAsync(IFormFile file, string folder)
    {
        if (!IsValidImage(file))
        {
            throw new InvalidOperationException("Invalid image file or file too large.");
        }

        var uniqueFileName = GenerateUniqueFileName(file.FileName);
        var targetSize = folder == "avatars" ? MaxAvatarSize : MaxPostImageSize;

        using var imageStream = file.OpenReadStream();
        var resizedImageBytes = await ResizeImageAsync(imageStream, targetSize);

        using var uploadStream = new MemoryStream(resizedImageBytes);

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(uniqueFileName, uploadStream),
            Folder = folder,
            PublicId = Path.GetFileNameWithoutExtension(uniqueFileName),
            Transformation = new Transformation()
                .Width(targetSize)
                .Height(targetSize)
                .Crop("limit")
                .Quality("auto")
                .FetchFormat("auto")
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
        {
            throw new InvalidOperationException($"Failed to upload image to Cloudinary: {uploadResult.Error.Message}");
        }

        return uploadResult.SecureUrl.ToString();
    }

    public async Task<string> UploadAsync(byte[] data, string fileName, string folder)
    {
        var uniqueFileName = GenerateUniqueFileName(fileName);

        using var uploadStream = new MemoryStream(data);

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(uniqueFileName, uploadStream),
            Folder = folder,
            PublicId = Path.GetFileNameWithoutExtension(uniqueFileName),
            Transformation = new Transformation()
                .Quality("auto")
                .FetchFormat("auto")
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
        {
            throw new InvalidOperationException($"Failed to upload image to Cloudinary: {uploadResult.Error.Message}");
        }

        return uploadResult.SecureUrl.ToString();
    }

    public async Task DeleteAsync(string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl))
        {
            return;
        }

        try
        {
            // Extract public ID from Cloudinary URL
            var uri = new Uri(imageUrl);
            var path = uri.AbsolutePath;
            var publicId = path.TrimStart('/').Replace("https://res.cloudinary.com/", "");
            
            // Remove file extension and folder parts to get the public ID
            var lastSlashIndex = publicId.LastIndexOf('/');
            if (lastSlashIndex > 0)
            {
                publicId = publicId.Substring(0, lastSlashIndex);
            }

            var deletionParams = new DeletionParams(publicId);
            var deletionResult = await _cloudinary.DestroyAsync(deletionParams);

            if (deletionResult.Error != null)
            {
                // Log error but don't throw - image might not exist
                Console.WriteLine($"Failed to delete image from Cloudinary: {deletionResult.Error.Message}");
            }
        }
        catch (Exception ex)
        {
            // Log error but don't throw - image might not be ours
            Console.WriteLine($"Error deleting image: {ex.Message}");
        }
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

        // For Cloudinary, we should always have full URLs
        return imagePath;
    }

    public string GenerateUniqueFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
        var guid = Guid.NewGuid().ToString("N");
        return $"{guid}{extension}";
    }

    private async Task<byte[]> ResizeImageAsync(Stream imageStream, int maxSize)
    {
        // For Cloudinary, we can skip local resizing and let Cloudinary handle it
        // This is more efficient and avoids Windows-specific System.Drawing issues
        using var memoryStream = new MemoryStream();
        await imageStream.CopyToAsync(memoryStream);
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
