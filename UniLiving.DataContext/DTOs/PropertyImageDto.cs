namespace UniLiving.DataContext.DTOs
{
    public class PropertyImageDto
    {
        public int Id { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public bool IsMainImage { get; set; }
        public int DisplayOrder { get; set; }
    }
}
