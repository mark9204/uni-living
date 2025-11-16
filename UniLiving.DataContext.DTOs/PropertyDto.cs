public class PropertyDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; }
    public decimal? Size { get; set; }
    public int? RoomCount { get; set; }
    public bool HasBalcony { get; set; }
    public bool HasParking { get; set; }
    public bool HasElevator { get; set; }
    public bool PetsAllowed { get; set; }
    public bool SmokingAllowed { get; set; }
    public bool IsActive { get; set; }
    public bool IsApproved { get; set; }
    public DateTime CreatedAt { get; set; }
    public PropertyCategoryDto? Category { get; set; }
    public List<PropertyImageDto> Images { get; set; }
    public UserDto? Owner { get; set; }
    public string? OwnerName { get; set; }
}