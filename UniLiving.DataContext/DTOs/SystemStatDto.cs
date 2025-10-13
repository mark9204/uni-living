using System;

namespace UniLiving.DataContext.DTOs
{
    public class SystemStatDto
    {
        public int Id { get; set; }
        public string StatName { get; set; } = string.Empty;
        public string StatValue { get; set; } = string.Empty;
        public DateTime StatDate { get; set; }
    }
}
