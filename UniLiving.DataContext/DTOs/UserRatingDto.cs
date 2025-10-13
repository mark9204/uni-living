using System;

namespace UniLiving.DataContext.DTOs
{
    public class UserRatingDto
    {
        public int Id { get; set; }
        public int RatedUserId { get; set; }
        public int RaterUserId { get; set; }
        public bool IsPositive { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
