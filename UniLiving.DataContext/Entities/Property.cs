using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniLiving.DataContext.Entities
{
    public class Property : AbstractEntity
    {
        [ForeignKey(nameof(Owner))]
        public int OwnerId { get; set; }
        public User Owner { get; set; } = null!;

        [ForeignKey(nameof(Category))]
        public int CategoryId { get; set; }
        public PropertyCategory Category { get; set; } = null!;

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        [Required, MaxLength(500)]
        public string Address { get; set; } = string.Empty;
        [Required, MaxLength(100)]
        public string City { get; set; } = string.Empty;
        [MaxLength(20)]
        public string? PostalCode { get; set; }
        [Required, MaxLength(100)]
        public string Country { get; set; } = "Hungary";
        [Column(TypeName = "decimal(10,8)")]
        public decimal? Latitude { get; set; }
        [Column(TypeName = "decimal(11,8)")]
        public decimal? Longitude { get; set; }
        [Required, Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }
        [Required, MaxLength(10)]
        public string Currency { get; set; } = "HUF";
        [Column(TypeName = "decimal(8,2)")]
        public decimal? Size { get; set; }
        public int? RoomCount { get; set; }
        public int? BathroomCount { get; set; }
        public bool HasBalcony { get; set; }
        public bool HasParking { get; set; }
        public bool HasElevator { get; set; }
        public bool PetsAllowed { get; set; }
        public bool SmokingAllowed { get; set; }
        public DateTime? AvailableFrom { get; set; }
        public DateTime? AvailableTo { get; set; }
        public bool IsActive { get; set; }
        public bool IsApproved { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public virtual ICollection<PropertyImage> Images { get; set; } = new List<PropertyImage>();
        public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
        public virtual ICollection<ChatRoom> ChatRooms { get; set; } = new List<ChatRoom>();
    }
}
