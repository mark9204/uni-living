using System;
using System.ComponentModel.DataAnnotations;

namespace UniLiving.DataContext.Entities
{
    public class SystemStat : AbstractEntity
    {
        [Required, MaxLength(100)]
        public string StatName { get; set; } = string.Empty;
        [Required, MaxLength(500)]
        public string StatValue { get; set; } = string.Empty;
        public DateTime StatDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
