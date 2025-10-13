using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniLiving.DataContext.Entities
{
    public class AdminAuditLog : AbstractEntity
    {
        [ForeignKey(nameof(Admin))]
        public int AdminId { get; set; }
        public User Admin { get; set; } = null!;
        [Required, MaxLength(100)]
        public string Action { get; set; } = string.Empty;
        [Required, MaxLength(50)]
        public string TargetEntity { get; set; } = string.Empty;
        public int TargetId { get; set; }
        public string? Details { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
