namespace BlogApi.Interfaces.Storage;

public interface IImageStorage
{
    /// <summary>
    /// Uploads an image file to storage
    /// </summary>
    /// <param name="file">The image file to upload</param>
    /// <param name="folder">The folder path (e.g., "posts", "avatars")</param>
    /// <returns>The relative URL/path to access the uploaded image</returns>
    Task<string> UploadAsync(IFormFile file, string folder);

    /// <summary>
    /// Uploads image data as bytes to storage
    /// </summary>
    /// <param name="data">The image data as bytes</param>
    /// <param name="fileName">The original file name</param>
    /// <param name="folder">The folder path (e.g., "posts", "avatars")</param>
    /// <returns>The relative URL/path to access the uploaded image</returns>
    Task<string> UploadAsync(byte[] data, string fileName, string folder);

    /// <summary>
    /// Deletes an image from storage
    /// </summary>
    /// <param name="imageUrl">The URL/path of the image to delete</param>
    Task DeleteAsync(string imageUrl);

    /// <summary>
    /// Gets the full URL for an image path
    /// </summary>
    /// <param name="imagePath">The relative path of the image</param>
    /// <returns>The full URL to access the image</returns>
    string GetUrl(string imagePath);

    /// <summary>
    /// Generates a unique file name to prevent conflicts
    /// </summary>
    /// <param name="originalFileName">The original file name</param>
    /// <returns>A unique file name with GUID</returns>
    string GenerateUniqueFileName(string originalFileName);

    /// <summary>
    /// Validates if a file is a valid image
    /// </summary>
    /// <param name="file">The file to validate</param>
    /// <returns>True if valid image, false otherwise</returns>
    bool IsValidImage(IFormFile file);
}
