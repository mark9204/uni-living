using System;
using System.Collections.Generic;

namespace UniLiving.DataContext.DTOs
{
    public class ChatRoomDto
    {
        public int Id { get; set; }
        public int PropertyId { get; set; }
        public int TenantId { get; set; }
        public int LandlordId { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<ChatMessageDto> Messages { get; set; } = new();
    }
}
