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

        public PropertyController(IPropertyService propertyService)
        {
            _propertyService = propertyService;
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
        public async Task<ActionResult<PropertyDto>> Create([FromBody] PropertyDto propertyDto)
        {
            var created = await _propertyService.CreatePropertyAsync(propertyDto);
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
    }
}
