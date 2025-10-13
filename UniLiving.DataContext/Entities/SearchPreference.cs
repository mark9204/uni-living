using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniLiving.DataContext.Entities
{
    public class SearchPreference : AbstractEntity
    {
        [ForeignKey(nameof(User))]
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        [Column(TypeName = "decimal(10,2)")]
        public decimal? MinPrice { get; set; }
        [Column(TypeName = "decimal(10,2)")]
        public decimal? MaxPrice { get; set; }
        [Column(TypeName = "decimal(8,2)")]
        public decimal? MinSize { get; set; }
        [Column(TypeName = "decimal(8,2)")]
        public decimal? MaxSize { get; set; }
        public int? MinRooms { get; set; }
        public int? MaxRooms { get; set; }
        [MaxLength(500)]
        public string? Cities { get; set; }
        public bool? HasBalcony { get; set; }
        public bool? HasParking { get; set; }
        public bool? HasElevator { get; set; }
        public bool? PetsAllowed { get; set; }
        public bool? SmokingAllowed { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
