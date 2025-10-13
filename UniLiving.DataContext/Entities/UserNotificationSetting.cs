using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniLiving.DataContext.Entities
{
    public class UserNotificationSetting : AbstractEntity
    {
        [ForeignKey(nameof(User))]
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        [ForeignKey(nameof(NotificationType))]
        public int NotificationTypeId { get; set; }
        public NotificationType NotificationType { get; set; } = null!;
        public bool IsEnabled { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
