using BlogApi.DTOs;
using BlogApi.Interfaces.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers.Storage;

[ApiController]
[Route("api/images")]
public class ImageUploadController : BaseController
{
    private readonly IImageStorage _imageStorage;

    public ImageUploadController(IImageStorage imageStorage)
    {
        _imageStorage = imageStorage;
    }

    [Authorize]
    [HttpPost("upload")]
    public async Task<ActionResult<ImageUploadResponse>> UploadImage(IFormFile file, [FromQuery] string folder = "posts")
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded." });
        }

        try
        {
            var imageUrl = await _imageStorage.UploadAsync(file, folder);
            var fullUrl = _imageStorage.GetUrl(imageUrl);

            return Ok(new ImageUploadResponse
            {
                Url = fullUrl,
                RelativePath = imageUrl,
                FileName = file.FileName,
                Size = file.Length
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch
        {
            return StatusCode(500, new { message = "Failed to upload image." });
        }
    }

    [Authorize]
    [HttpDelete("{*imagePath}")]
    public async Task<ActionResult> DeleteImage(string imagePath)
    {
        try
        {
            await _imageStorage.DeleteAsync(imagePath);
            return Ok(new { message = "Image deleted successfully." });
        }
        catch
        {
            return StatusCode(500, new { message = "Failed to delete image." });
        }
    }
}
