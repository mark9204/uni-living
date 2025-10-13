using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniLiving.DataContext.Entities
{
    public class PropertyImage : AbstractEntity
    {
        [ForeignKey(nameof(Property))]
        public int PropertyId { get; set; }
        public Property Property { get; set; } = null!;

        [Required, MaxLength(255)]
        public string FileName { get; set; } = string.Empty;
        [Required, MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;
        public long FileSize { get; set; }
        [Required, MaxLength(100)]
        public string MimeType { get; set; } = string.Empty;
        public bool IsMainImage { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
