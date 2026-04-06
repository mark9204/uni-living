using System.Threading.Tasks;
using UniLiving.DataContext.DTOs;

namespace UniLiving.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<LandlordDashboardDto> GetLandlordStatsAsync(int userId);
        Task<TenantDashboardDto> GetTenantStatsAsync(int userId);
    }
}
