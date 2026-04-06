using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniLiving.DataContext.DTOs;
using UniLiving.Services.Interfaces;

namespace UniLiving.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("landlord-stats")]
        [Authorize(Roles = "Landlord,Owner")]
        public async Task<ActionResult<LandlordDashboardDto>> GetLandlordStats()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            var stats = await _dashboardService.GetLandlordStatsAsync(userId);
            return Ok(stats);
        }

        [HttpGet("tenant-stats")]
        [Authorize(Roles = "Tenant,Student")]
        public async Task<ActionResult<TenantDashboardDto>> GetTenantStats()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            var stats = await _dashboardService.GetTenantStatsAsync(userId);
            return Ok(stats);
        }
    }
}
