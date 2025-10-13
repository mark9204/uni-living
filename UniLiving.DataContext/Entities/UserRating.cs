using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniLiving.DataContext.Entities
{
    public class UserRating : AbstractEntity
    {
        [ForeignKey(nameof(RatedUser))]
        public int RatedUserId { get; set; }
        public User RatedUser { get; set; } = null!;
        [ForeignKey(nameof(RaterUser))]
        public int RaterUserId { get; set; }
        public User RaterUser { get; set; } = null!;
        public bool IsPositive { get; set; }
        [MaxLength(1000)]
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
