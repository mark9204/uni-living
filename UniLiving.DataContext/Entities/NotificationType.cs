using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace UniLiving.DataContext.Entities
{
    public class NotificationType : AbstractEntity
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        [MaxLength(200)]
        public string? Description { get; set; }
        public bool DefaultEnabled { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual ICollection<UserNotificationSetting> Settings { get; set; } = new List<UserNotificationSetting>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}
