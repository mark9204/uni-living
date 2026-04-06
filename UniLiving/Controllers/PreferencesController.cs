using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using UniLiving.DataContext.DTOs;
using UniLiving.Services.Services;

namespace UniLiving.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PreferencesController : ControllerBase
    {
        private readonly SearchPreferenceService _preferenceService;

        public PreferencesController(SearchPreferenceService preferenceService)
        {
            _preferenceService = preferenceService;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetMyPreferences()
        {
            var prefs = await _preferenceService.GetUserPreferencesAsync(GetUserId());
            return Ok(prefs);
        }

        [HttpPost]
        public async Task<IActionResult> AddPreference([FromBody] SearchPreferenceDto dto)
        {
            var pref = await _preferenceService.CreatePreferenceAsync(GetUserId(), dto);
            return Ok(pref);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePreference(int id)
        {
            var success = await _preferenceService.DeletePreferenceAsync(id, GetUserId());
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}
