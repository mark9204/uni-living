using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using UniLiving.DataContext.DTOs;
using UniLiving.Services.Services;

namespace UniLiving.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(IChatService chatService, ILogger<ChatHub> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = GetUserId();
            if (userId.HasValue)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
                _logger.LogInformation($"User {userId} connected to chat hub");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetUserId();
            if (userId.HasValue)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
                _logger.LogInformation($"User {userId} disconnected from chat hub");
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinChatRoom(int chatRoomId)
        {
            var userId = GetUserId();
            if (!userId.HasValue)
            {
                throw new HubException("User not authenticated");
            }

            var hasAccess = await _chatService.UserHasAccessToChatRoomAsync(chatRoomId, userId.Value);
            if (!hasAccess)
            {
                throw new HubException("Access denied to this chat room");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"chatroom_{chatRoomId}");
            _logger.LogInformation($"User {userId} joined chat room {chatRoomId}");
        }

        public async Task LeaveChatRoom(int chatRoomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chatroom_{chatRoomId}");
            var userId = GetUserId();
            _logger.LogInformation($"User {userId} left chat room {chatRoomId}");
        }

        public async Task SendMessage(int chatRoomId, string message)
        {
            var userId = GetUserId();
            if (!userId.HasValue)
            {
                throw new HubException("User not authenticated");
            }

            try
            {
                var chatMessage = await _chatService.SendMessageAsync(chatRoomId, userId.Value, message);

                // Broadcast to all users in the chat room
                await Clients.Group($"chatroom_{chatRoomId}")
                    .SendAsync("ReceiveMessage", chatMessage);

                // Push Generic Message Notification
                var notifService = Context.GetHttpContext()?.RequestServices?.GetService<NotificationService>();
                var chatRoom = await _chatService.GetChatRoomByIdAsync(chatRoomId, userId.Value);
                if (notifService != null && chatRoom != null)
                {
                    var recipientId = chatRoom.TenantId == userId.Value ? chatRoom.LandlordId : chatRoom.TenantId;
                    
                    var newNotif = new UniLiving.DataContext.Entities.Notification
                    {
                        UserId = recipientId,
                        Title = $"Új üzenet: {chatMessage.SenderName}",
                        Message = message.Length > 40 ? message.Substring(0, 37) + "..." : message,
                        RelatedEntityType = "Message",
                        RelatedEntityId = chatRoomId,
                        IsRead = false
                    };
                    var dto = await notifService.CreateNotificationAsync(newNotif);
                    await Clients.Group($"user_{recipientId}").SendAsync("ReceiveNotification", dto);
                }

                _logger.LogInformation($"Message sent in chat room {chatRoomId} by user {userId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending message in chat room {chatRoomId}");
                throw new HubException("Failed to send message");
            }
        }

        public async Task MarkMessageAsRead(int messageId)
        {
            var userId = GetUserId();
            if (!userId.HasValue)
            {
                throw new HubException("User not authenticated");
            }

            try
            {
                var updatedMessage = await _chatService.MarkMessageAsReadAsync(messageId, userId.Value);
                
                if (updatedMessage != null)
                {
                    // Notify the sender that their message was read
                    await Clients.Group($"user_{updatedMessage.SenderId}")
                        .SendAsync("MessageRead", updatedMessage);

                    _logger.LogInformation($"Message {messageId} marked as read by user {userId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error marking message {messageId} as read");
                throw new HubException("Failed to mark message as read");
            }
        }

        public async Task MarkChatRoomAsRead(int chatRoomId)
        {
            var userId = GetUserId();
            if (!userId.HasValue)
            {
                throw new HubException("User not authenticated");
            }

            try
            {
                var readMessages = await _chatService.MarkChatRoomAsReadAsync(chatRoomId, userId.Value);
                
                // Notify all messages were read
                foreach (var message in readMessages)
                {
                    await Clients.Group($"user_{message.SenderId}")
                        .SendAsync("MessageRead", message);
                }

                _logger.LogInformation($"Chat room {chatRoomId} marked as read by user {userId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error marking chat room {chatRoomId} as read");
                throw new HubException("Failed to mark chat room as read");
            }
        }

        public async Task UserTyping(int chatRoomId)
        {
            var userId = GetUserId();
            if (!userId.HasValue)
            {
                throw new HubException("User not authenticated");
            }

            var userName = Context.User?.Identity?.Name ?? "Unknown";

            // Broadcast typing indicator to other users in the chat room (excluding sender)
            await Clients.OthersInGroup($"chatroom_{chatRoomId}")
                .SendAsync("UserTyping", new { userId, userName, chatRoomId });
        }

        public async Task UserStoppedTyping(int chatRoomId)
        {
            var userId = GetUserId();
            if (!userId.HasValue)
            {
                throw new HubException("User not authenticated");
            }

            // Broadcast stopped typing to other users in the chat room (excluding sender)
            await Clients.OthersInGroup($"chatroom_{chatRoomId}")
                .SendAsync("UserStoppedTyping", new { userId, chatRoomId });
        }

        private int? GetUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            return null;
        }
    }
}
