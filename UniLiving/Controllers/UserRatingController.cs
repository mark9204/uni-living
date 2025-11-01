using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using UniLiving.DataContext.DTOs;
using UniLiving.Services.Services;

namespace UniLiving.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserRatingController : ControllerBase
    {
        private readonly IUserRatingService _service;

        public UserRatingController(IUserRatingService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserRatingDto>>> GetAll()
        {
            var result = await _service.GetAllUserRatingsAsync();
            return Ok(result);
        }

        [HttpGet("{id:int}", Name = "GetUserRatingById")]
        public async Task<ActionResult<UserRatingDto>> GetById(int id)
        {
            var item = await _service.GetUserRatingByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<UserRatingDto>> Create([FromBody] UserRatingDto dto)
        {
            var created = await _service.CreateUserRatingAsync(dto);
            return CreatedAtRoute("GetUserRatingById", new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<UserRatingDto>> Update(int id, [FromBody] UserRatingDto dto)
        {
            var updated = await _service.UpdateUserRatingAsync(id, dto);
            return Ok(updated);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.DeleteUserRatingAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}