using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UniLiving.DataContext.DTOs
{
    public class PropertyFilterDto
    {
        // Search
        public string? SearchTerm { get; set; }

        // Filtering
        public int? CategoryId { get; set; }
        public string? City { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public float? MinSize { get; set; }
        public float? MaxSize { get; set; }
        public int? MinRoomCount { get; set; }
        public int? MaxRoomCount { get; set; }
        public bool? HasBalcony { get; set; }
        public bool? HasParking { get; set; }
        public bool? HasElevator { get; set; }
        public bool? PetsAllowed { get; set; }
        public bool? SmokingAllowed { get; set; }

        // Sorting
        public string? SortBy { get; set; }
        public string SortDirection { get; set; } = "asc";

        // Pagination
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
