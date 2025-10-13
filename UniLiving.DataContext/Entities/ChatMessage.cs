using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniLiving.DataContext.Entities
{
    public class ChatMessage : AbstractEntity
    {
        [ForeignKey(nameof(ChatRoom))]
        public int ChatRoomId { get; set; }
        public ChatRoom ChatRoom { get; set; } = null!;
        [ForeignKey(nameof(Sender))]
        public int SenderId { get; set; }
        public User Sender { get; set; } = null!;
        [Required]
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
