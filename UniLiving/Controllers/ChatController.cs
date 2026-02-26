using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UniLiving.DataContext.DTOs;
using UniLiving.Services.Services;

namespace UniLiving.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly ILogger<ChatController> _logger;

        public ChatController(IChatService chatService, ILogger<ChatController> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return userId;
        }

        [HttpGet("rooms")]
        public async Task<ActionResult<IEnumerable<ChatRoomDto>>> GetUserChatRooms()
        {
            var userId = GetUserId();
            var rooms = await _chatService.GetUserChatRoomsAsync(userId);
            return Ok(rooms);
        }

        [HttpGet("rooms/{roomId}")]
        public async Task<ActionResult<ChatRoomDto>> GetChatRoom(int roomId)
        {
            var userId = GetUserId();
            try
            {
                var room = await _chatService.GetChatRoomByIdAsync(roomId, userId);
                if (room == null)
                    return NotFound();
                return Ok(room);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning($"Unauthorized access attempt to chat room {roomId} by user {userId}");
                return Forbid();
            }
        }

        [HttpPost("rooms/{propertyId}")]
        public async Task<ActionResult<ChatRoomDto>> GetOrCreateChatRoom(int propertyId)
        {
            var userId = GetUserId();
            try
            {
                var room = await _chatService.GetOrCreateChatRoomAsync(propertyId, userId);
                return Ok(room);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("rooms/{roomId}/messages")]
        public async Task<ActionResult<IEnumerable<ChatMessageDto>>> GetChatMessages(int roomId, [FromQuery] int take = 50)
        {
            if (take <= 0 || take > 100)
                take = 50;

            var userId = GetUserId();
            try
            {
                var messages = await _chatService.GetChatMessagesAsync(roomId, userId, take);
                return Ok(messages);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning($"Unauthorized access attempt to messages in room {roomId} by user {userId}");
                return Forbid();
            }
        }

        [HttpPost("rooms/{roomId}/messages/{messageId}/read")]
        public async Task<IActionResult> MarkMessageAsRead(int roomId, int messageId)
        {
            var userId = GetUserId();
            try
            {
                var result = await _chatService.MarkMessageAsReadAsync(messageId, userId);
                if (result == null)
                    return NoContent();
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
        }

        [HttpPost("rooms/{roomId}/messages")]
        public async Task<ActionResult<ChatMessageDto>> SendMessage(int roomId, [FromBody] ChatMessageCreateDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Message))
                return BadRequest(new { error = "Message cannot be empty" });

            var userId = GetUserId();
            try
            {
                var message = await _chatService.SendMessageAsync(roomId, userId, request.Message);
                return Ok(message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpPost("rooms/{roomId}/read")]
        public async Task<ActionResult<IEnumerable<ChatMessageDto>>> MarkChatRoomAsRead(int roomId)
        {
            var userId = GetUserId();
            try
            {
                var messages = await _chatService.MarkChatRoomAsReadAsync(roomId, userId);
                return Ok(messages);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
        }
    }
}
