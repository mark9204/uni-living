using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UniLiving.DataContext;
using UniLiving.DataContext.DTOs;
using UniLiving.DataContext.Entities;

namespace UniLiving.Services.Services
{
    public interface IChatService
    {
        Task<bool> UserHasAccessToChatRoomAsync(int chatRoomId, int userId);
        Task<ChatMessageDto> SendMessageAsync(int chatRoomId, int senderId, string message);
        Task<ChatMessageDto?> MarkMessageAsReadAsync(int messageId, int userId);
        Task<IReadOnlyList<ChatMessageDto>> MarkChatRoomAsReadAsync(int chatRoomId, int userId);
        Task<IReadOnlyList<ChatRoomDto>> GetUserChatRoomsAsync(int userId);
        Task<ChatRoomDto> GetOrCreateChatRoomAsync(int propertyId, int userId);
        Task<ChatRoomDto?> GetChatRoomByIdAsync(int roomId, int userId);
        Task<IReadOnlyList<ChatMessageDto>> GetChatMessagesAsync(int roomId, int userId, int take = 50);
    }

    public class ChatService : IChatService
    {
        private readonly UniDBContext _context;
        private readonly IMapper _mapper;

        public ChatService(UniDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<bool> UserHasAccessToChatRoomAsync(int chatRoomId, int userId)
        {
            return await _context.ChatRooms
                .AnyAsync(cr => cr.Id == chatRoomId && (cr.TenantId == userId || cr.LandlordId == userId));
        }

        public async Task<ChatMessageDto> SendMessageAsync(int chatRoomId, int senderId, string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                throw new ArgumentException("Message cannot be empty", nameof(message));

            var hasAccess = await UserHasAccessToChatRoomAsync(chatRoomId, senderId);
            if (!hasAccess)
                throw new UnauthorizedAccessException("Access denied to this chat room");

            var sender = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == senderId);
            if (sender == null)
                throw new KeyNotFoundException("Sender not found");

            var chatMessage = new ChatMessage
            {
                ChatRoomId = chatRoomId,
                SenderId = senderId,
                Message = message.Trim(),
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.ChatMessages.Add(chatMessage);
            await _context.SaveChangesAsync();

            return new ChatMessageDto
            {
                Id = chatMessage.Id,
                ChatRoomId = chatMessage.ChatRoomId,
                SenderId = chatMessage.SenderId,
                Message = chatMessage.Message,
                IsRead = chatMessage.IsRead,
                CreatedAt = chatMessage.CreatedAt,
                ReadAt = chatMessage.ReadAt,
                SenderName = $"{sender.FirstName} {sender.LastName}"
            };
        }

        public async Task<ChatMessageDto?> MarkMessageAsReadAsync(int messageId, int userId)
        {
            var message = await _context.ChatMessages
                .Include(m => m.ChatRoom)
                .FirstOrDefaultAsync(m => m.Id == messageId);

            if (message == null)
                throw new KeyNotFoundException("Message not found");

            if (message.SenderId == userId)
                return null;

            var hasAccess = await UserHasAccessToChatRoomAsync(message.ChatRoomId, userId);
            if (!hasAccess)
                throw new UnauthorizedAccessException("Access denied to this chat room");

            if (!message.IsRead)
            {
                message.IsRead = true;
                message.ReadAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            var sender = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == message.SenderId);

            return new ChatMessageDto
            {
                Id = message.Id,
                ChatRoomId = message.ChatRoomId,
                SenderId = message.SenderId,
                Message = message.Message,
                IsRead = message.IsRead,
                CreatedAt = message.CreatedAt,
                ReadAt = message.ReadAt,
                SenderName = sender == null ? string.Empty : $"{sender.FirstName} {sender.LastName}"
            };
        }

        public async Task<IReadOnlyList<ChatMessageDto>> MarkChatRoomAsReadAsync(int chatRoomId, int userId)
        {
            var hasAccess = await UserHasAccessToChatRoomAsync(chatRoomId, userId);
            if (!hasAccess)
                throw new UnauthorizedAccessException("Access denied to this chat room");

            var messages = await _context.ChatMessages
                .Include(m => m.Sender)
                .Where(m => m.ChatRoomId == chatRoomId && m.SenderId != userId && !m.IsRead)
                .ToListAsync();

            if (messages.Count == 0)
                return Array.Empty<ChatMessageDto>();

            var now = DateTime.UtcNow;
            foreach (var message in messages)
            {
                message.IsRead = true;
                message.ReadAt = now;
            }

            await _context.SaveChangesAsync();

            return messages
                .Select(message => new ChatMessageDto
                {
                    Id = message.Id,
                    ChatRoomId = message.ChatRoomId,
                    SenderId = message.SenderId,
                    Message = message.Message,
                    IsRead = message.IsRead,
                    CreatedAt = message.CreatedAt,
                    ReadAt = message.ReadAt,
                    SenderName = $"{message.Sender.FirstName} {message.Sender.LastName}"
                })
                .ToList();
        }

        public async Task<IReadOnlyList<ChatRoomDto>> GetUserChatRoomsAsync(int userId)
        {
            var rooms = await _context.ChatRooms
                .Where(cr => (cr.TenantId == userId || cr.LandlordId == userId) && cr.IsActive)
                .Include(cr => cr.Tenant)
                .Include(cr => cr.Landlord)
                .Include(cr => cr.Property)
                .Include(cr => cr.Messages)
                .OrderByDescending(cr => cr.Messages.Max(m => m.CreatedAt))
                .ToListAsync();

            return rooms
                .Select(room => new ChatRoomDto
                {
                    Id = room.Id,
                    PropertyId = room.PropertyId,
                    TenantId = room.TenantId,
                    LandlordId = room.LandlordId,
                    IsActive = room.IsActive,
                    CreatedAt = room.CreatedAt,
                    Messages = room.Messages
                        .OrderByDescending(m => m.CreatedAt)
                        .Take(1)
                        .Select(m => new ChatMessageDto
                        {
                            Id = m.Id,
                            ChatRoomId = m.ChatRoomId,
                            SenderId = m.SenderId,
                            Message = m.Message,
                            IsRead = m.IsRead,
                            CreatedAt = m.CreatedAt,
                            ReadAt = m.ReadAt,
                            SenderName = m.Sender.FirstName + " " + m.Sender.LastName
                        })
                        .ToList()
                })
                .ToList();
        }

        public async Task<ChatRoomDto> GetOrCreateChatRoomAsync(int propertyId, int userId)
        {
            var property = await _context.Properties
                .FirstOrDefaultAsync(p => p.Id == propertyId);
            if (property == null)
                throw new KeyNotFoundException("Property not found");

            var landlordId = property.OwnerId;
            var tenantId = userId;

            if (landlordId == userId)
                throw new InvalidOperationException("Landlord cannot start chat with themselves");

            var existingRoom = await _context.ChatRooms
                .FirstOrDefaultAsync(cr => cr.PropertyId == propertyId && cr.TenantId == tenantId && cr.LandlordId == landlordId);

            if (existingRoom != null)
            {
                return new ChatRoomDto
                {
                    Id = existingRoom.Id,
                    PropertyId = existingRoom.PropertyId,
                    TenantId = existingRoom.TenantId,
                    LandlordId = existingRoom.LandlordId,
                    IsActive = existingRoom.IsActive,
                    CreatedAt = existingRoom.CreatedAt,
                    Messages = new()
                };
            }

            var newRoom = new ChatRoom
            {
                PropertyId = propertyId,
                TenantId = tenantId,
                LandlordId = landlordId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ChatRooms.Add(newRoom);
            await _context.SaveChangesAsync();

            return new ChatRoomDto
            {
                Id = newRoom.Id,
                PropertyId = newRoom.PropertyId,
                TenantId = newRoom.TenantId,
                LandlordId = newRoom.LandlordId,
                IsActive = newRoom.IsActive,
                CreatedAt = newRoom.CreatedAt,
                Messages = new()
            };
        }

        public async Task<ChatRoomDto?> GetChatRoomByIdAsync(int roomId, int userId)
        {
            var room = await _context.ChatRooms
                .Include(cr => cr.Tenant)
                .Include(cr => cr.Landlord)
                .Include(cr => cr.Property)
                .FirstOrDefaultAsync(cr => cr.Id == roomId);

            if (room == null)
                return null;

            var hasAccess = room.TenantId == userId || room.LandlordId == userId;
            if (!hasAccess)
                throw new UnauthorizedAccessException("Access denied to this chat room");

            return new ChatRoomDto
            {
                Id = room.Id,
                PropertyId = room.PropertyId,
                TenantId = room.TenantId,
                LandlordId = room.LandlordId,
                IsActive = room.IsActive,
                CreatedAt = room.CreatedAt,
                Messages = new()
            };
        }

        public async Task<IReadOnlyList<ChatMessageDto>> GetChatMessagesAsync(int roomId, int userId, int take = 50)
        {
            var hasAccess = await UserHasAccessToChatRoomAsync(roomId, userId);
            if (!hasAccess)
                throw new UnauthorizedAccessException("Access denied to this chat room");

            var messages = await _context.ChatMessages
                .Where(m => m.ChatRoomId == roomId)
                .Include(m => m.Sender)
                .OrderByDescending(m => m.CreatedAt)
                .Take(take)
                .ToListAsync();

            return messages
                .AsEnumerable()
                .Reverse()
                .Select(m => new ChatMessageDto
                {
                    Id = m.Id,
                    ChatRoomId = m.ChatRoomId,
                    SenderId = m.SenderId,
                    Message = m.Message,
                    IsRead = m.IsRead,
                    CreatedAt = m.CreatedAt,
                    ReadAt = m.ReadAt,
                    SenderName = $"{m.Sender.FirstName} {m.Sender.LastName}"
                })
                .ToList();
        }
    }
}
