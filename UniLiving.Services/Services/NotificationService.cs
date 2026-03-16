using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UniLiving.DataContext;
using UniLiving.DataContext.DTOs;
using UniLiving.DataContext.Entities;

namespace UniLiving.Services.Services
{
    public class NotificationService
    {
        private readonly UniDBContext _context;
        private readonly IMapper _mapper;

        public NotificationService(UniDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .ToListAsync();

            return _mapper.Map<List<NotificationDto>>(notifications);
        }

        public async Task MarkAsReadAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                 .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
                 
            if (notification != null)
            {
                notification.IsRead = true;
                notification.ReadAt = System.DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
        
        public async Task<NotificationDto> CreateNotificationAsync(Notification notification)
        {
            // Fallback NotificationType if not provided
            if (notification.NotificationTypeId == 0)
            {
                var defaultType = await _context.NotificationTypes.FirstOrDefaultAsync();
                if (defaultType != null)
                    notification.NotificationTypeId = defaultType.Id;
            }

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            
            return _mapper.Map<NotificationDto>(notification);
        }
    }
}
