namespace UniLiving.DataContext.DTOs
{
    public class SearchPreferenceDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public decimal? MinSize { get; set; }
        public decimal? MaxSize { get; set; }
        public int? MinRooms { get; set; }
        public int? MaxRooms { get; set; }
        public string? Cities { get; set; }
        public bool? HasBalcony { get; set; }
        public bool? HasParking { get; set; }
        public bool? HasElevator { get; set; }
        public bool? PetsAllowed { get; set; }
        public bool? SmokingAllowed { get; set; }
    }
}
