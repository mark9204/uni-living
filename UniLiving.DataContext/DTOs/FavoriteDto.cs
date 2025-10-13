using System;

namespace UniLiving.DataContext.DTOs
{
    public class FavoriteDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PropertyId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
