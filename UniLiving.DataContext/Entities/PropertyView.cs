using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniLiving.DataContext.Entities
{
    public class PropertyView : AbstractEntity
    {
        [ForeignKey(nameof(Property))]
        public int PropertyId { get; set; }
        public virtual Property Property { get; set; } = null!;

        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
    }
}
