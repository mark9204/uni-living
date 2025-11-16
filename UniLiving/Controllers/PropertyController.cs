using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniLiving.Services.Services;
using UniLiving.DataContext.DTOs;

namespace UniLiving.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertyController : ControllerBase
    {
        private readonly IPropertyService _propertyService;
        private readonly IPropertyImageService _propertyImageService;
        private readonly IFileStorageService _fileStorageService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PropertyController(
            IPropertyService propertyService,
            IPropertyImageService propertyImageService,
            IFileStorageService fileStorageService,
            IHttpContextAccessor httpContextAccessor)
        {
            _propertyService = propertyService;
            _propertyImageService = propertyImageService;
            _fileStorageService = fileStorageService;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PropertyDto>>> GetAll()
        {
            var properties = await _propertyService.GetAllPropertiesAsync();
            return Ok(properties);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PropertyDto>> Get(int id)
        {
            var property = await _propertyService.GetPropertyByIdAsync(id);
            if (property == null)
                return NotFound();
            return Ok(property);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<PropertyDto>> Create([FromBody] PropertyDto propertyDto)
        {
            var created = await _propertyService.CreatePropertyAsync(propertyDto, _httpContextAccessor);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PropertyDto>> Update(int id, [FromBody] PropertyDto propertyDto)
        {
            var updated = await _propertyService.UpdatePropertyAsync(id, propertyDto);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _propertyService.DeletePropertyAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }

        // Image endpoints
        [HttpPost("{propertyId}/images")]
        public async Task<ActionResult<PropertyImageDto>> UploadImage(int propertyId, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "No file provided" });

            try
            {
                // Frontend validation check
                if (!await _fileStorageService.ValidateImageAsync(file.FileName, file.Length))
                    return BadRequest(new { error = "Invalid file format or size exceeds limit" });

                // Save file (includes MIME type validation via magic bytes)
                using (var stream = file.OpenReadStream())
                {
                    var secureFileName = await _fileStorageService.SavePropertyImageAsync(
                        stream,
                        file.FileName,
                        propertyId);
                    
                    // Save to database
                    var image = await _propertyImageService.AddPropertyImageAsync(
                        propertyId,
                        secureFileName,
                        file.FileName,
                        file.Length,
                        file.ContentType ?? "application/octet-stream");

                    return CreatedAtAction(nameof(GetPropertyImages), new { propertyId }, image);
                }
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "File upload failed", details = ex.Message });
            }
        }

        [HttpGet("{propertyId}/images")]
        public async Task<ActionResult<IEnumerable<PropertyImageDto>>> GetPropertyImages(int propertyId)
        {
            var images = await _propertyImageService.GetPropertyImagesAsync(propertyId);
            return Ok(images);
        }

        [HttpDelete("images/{imageId}")]
        public async Task<IActionResult> DeleteImage(int imageId)
        {
            var image = await _propertyImageService.GetPropertyImageByIdAsync(imageId);
            if (image == null)
                return NotFound();

            // Delete from file system
            await _fileStorageService.DeletePropertyImageAsync(image.FilePath);

            // Delete from database
            await _propertyImageService.DeletePropertyImageAsync(imageId);

            return NoContent();
        }

        [HttpPost("images/{imageId}/set-main")]
        public async Task<IActionResult> SetMainImage(int imageId, [FromQuery] int propertyId)
        {
            var image = await _propertyImageService.GetPropertyImageByIdAsync(imageId);
            if (image == null)
                return NotFound();

            var result = await _propertyImageService.SetMainImageAsync(propertyId, imageId);
            if (!result)
                return BadRequest(new { error = "Failed to set main image" });

            return Ok(new { success = true, message = "Main image set successfully" });
        }
    }
}
