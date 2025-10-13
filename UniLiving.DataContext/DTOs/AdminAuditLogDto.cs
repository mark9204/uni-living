using System;

namespace UniLiving.DataContext.DTOs
{
    public class AdminAuditLogDto
    {
        public int Id { get; set; }
        public int AdminId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string TargetEntity { get; set; } = string.Empty;
        public int TargetId { get; set; }
        public string? Details { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
