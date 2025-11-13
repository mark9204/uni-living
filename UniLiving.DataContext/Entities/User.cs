using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniLiving.DataContext.Entities
{
    public class User : AbstractEntity
    {
        [Required, MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        [Required, MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        [Required, MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public bool IsEmailVerified { get; set; }
        public bool IsActive { get; set; }
        [ForeignKey(nameof(Role))]
        public int RoleId { get; set; }
        public virtual Role Role { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public virtual ICollection<EmailVerificationToken> EmailVerificationTokens { get; set; } = new List<EmailVerificationToken>();
        public virtual ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();
        public virtual ICollection<Property> Properties { get; set; } = new List<Property>();
        public virtual ICollection<UserRating> GivenRatings { get; set; } = new List<UserRating>();
        public virtual ICollection<UserRating> ReceivedRatings { get; set; } = new List<UserRating>();
        public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
        public virtual ICollection<ChatRoom> TenantChatRooms { get; set; } = new List<ChatRoom>();
        public virtual ICollection<ChatRoom> LandlordChatRooms { get; set; } = new List<ChatRoom>();
        public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public virtual SearchPreference? SearchPreference { get; set; }
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}