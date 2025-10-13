using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniLiving.DataContext.Entities
{
    public class Notification : AbstractEntity
    {
        [ForeignKey(nameof(User))]
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        [ForeignKey(nameof(NotificationType))]
        public int NotificationTypeId { get; set; }
        public NotificationType NotificationType { get; set; } = null!;
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        [Required, MaxLength(1000)]
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public int? RelatedEntityId { get; set; }
        [MaxLength(50)]
        public string? RelatedEntityType { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
