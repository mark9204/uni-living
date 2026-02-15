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
    }
}
