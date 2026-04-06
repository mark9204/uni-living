using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using UniLiving.DataContext;
using UniLiving.DataContext.DTOs;
using UniLiving.Services.Interfaces;

namespace UniLiving.Services.Implementations
{
    public class DashboardService : IDashboardService
    {
        private readonly UniDBContext _context;

        public DashboardService(UniDBContext context)
        {
            _context = context;
        }

        public async Task<LandlordDashboardDto> GetLandlordStatsAsync(int userId)
        {
            var activeListings = await _context.Properties
                .CountAsync(p => p.OwnerId == userId && p.IsActive);

            var adViews = await _context.PropertyViews
                .Include(v => v.Property)
                .CountAsync(v => v.Property.OwnerId == userId && v.ViewedAt > DateTime.UtcNow.AddDays(-7));

            var unreadMessages = await _context.ChatMessages
                .Include(m => m.ChatRoom)
                .CountAsync(m => m.ChatRoom.Property.OwnerId == userId && !m.IsRead && m.SenderId != userId);

            return new LandlordDashboardDto
            {
                ActiveListings = activeListings,
                TotalAdViews = adViews,
                UnreadMessages = unreadMessages
            };
        }

        public async Task<TenantDashboardDto> GetTenantStatsAsync(int userId)
        {
            var savedFavorites = await _context.Favorites
                .CountAsync(f => f.UserId == userId);

            var newProperties = await _context.Properties
                .CountAsync(p => p.IsActive && p.CreatedAt > DateTime.UtcNow.AddDays(-7));

            var unreadMessages = await _context.ChatMessages
                .Include(m => m.ChatRoom)
                .CountAsync(m => m.ChatRoom.TenantId == userId && !m.IsRead && m.SenderId != userId);

            return new TenantDashboardDto
            {
                SavedFavorites = savedFavorites,
                NewNotifications = newProperties,
                UnreadMessages = unreadMessages
            };
        }
    }
}
