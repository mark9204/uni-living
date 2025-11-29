using System.Collections.Generic;
using System;

namespace UniLiving.DataContext.DTOs
{
    public class ListingDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public decimal Size { get; set; }
        public int RoomCount { get; set; }
        public List<PropertyImageDto> Images { get; set; } = new();
        public string City { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
