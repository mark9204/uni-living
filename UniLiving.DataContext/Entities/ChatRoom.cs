using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniLiving.DataContext.Entities
{
    public class ChatRoom : AbstractEntity
    {
        [ForeignKey(nameof(Property))]
        public int PropertyId { get; set; }
        public Property Property { get; set; } = null!;
        [ForeignKey(nameof(Tenant))]
        public int TenantId { get; set; }
        public User Tenant { get; set; } = null!;
        [ForeignKey(nameof(Landlord))]
        public int LandlordId { get; set; }
        public User Landlord { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}
