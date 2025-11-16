using System;
using Microsoft.EntityFrameworkCore;
using UniLiving.DataContext.Entities;

namespace UniLiving.DataContext
{
    public class UniDBContext : DbContext
    {
        private static readonly DateTime _seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public UniDBContext(DbContextOptions<UniDBContext> options)
            : base(options)
        {
        }

        // DbSets for tables
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<EmailVerificationToken> EmailVerificationTokens { get; set; } = null!;
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; } = null!;
        public DbSet<Property> Properties { get; set; } = null!;
        public DbSet<PropertyCategory> PropertyCategories { get; set; } = null!;
        public DbSet<PropertyImage> PropertyImages { get; set; } = null!;
        public DbSet<UserRating> UserRatings { get; set; } = null!;
        public DbSet<Favorite> Favorites { get; set; } = null!;
        public DbSet<ChatRoom> ChatRooms { get; set; } = null!;
        public DbSet<ChatMessage> ChatMessages { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<NotificationType> NotificationTypes { get; set; } = null!;
        public DbSet<UserNotificationSetting> UserNotificationSettings { get; set; } = null!;
        public DbSet<SearchPreference> SearchPreferences { get; set; } = null!;
        public DbSet<SystemStat> SystemStats { get; set; } = null!;
        public DbSet<AdminAuditLog> AdminAuditLogs { get; set; } = null!;
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique indexes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Role>()
                .HasIndex(r => r.Name)
                .IsUnique();

            modelBuilder.Entity<PropertyCategory>()
                .HasIndex(pc => pc.Name)
                .IsUnique();

            modelBuilder.Entity<NotificationType>()
                .HasIndex(nt => nt.Name)
                .IsUnique();

            // Composite unique keys
            modelBuilder.Entity<UserRating>()
                .HasIndex(ur => new { ur.RatedUserId, ur.RaterUserId })
                .IsUnique();

            modelBuilder.Entity<Favorite>()
                .HasIndex(f => new { f.UserId, f.PropertyId })
                .IsUnique();

            modelBuilder.Entity<ChatRoom>()
                .HasIndex(cr => new { cr.PropertyId, cr.TenantId })
                .IsUnique();

            modelBuilder.Entity<UserNotificationSetting>()
                .HasIndex(uns => new { uns.UserId, uns.NotificationTypeId })
                .IsUnique();

            modelBuilder.Entity<SearchPreference>()
                .HasIndex(sp => sp.UserId)
                .IsUnique();

            modelBuilder.Entity<SystemStat>()
                .HasIndex(ss => new { ss.StatName, ss.StatDate })
                .IsUnique();

            // Relationship configuration
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Property>()
                .HasOne(p => p.Owner)
                .WithMany(u => u.Properties)
                .HasForeignKey(p => p.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Property>()
                .HasOne(p => p.Category)
                .WithMany(pc => pc.Properties)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PropertyImage>()
                .HasOne(pi => pi.Property)
                .WithMany(p => p.Images)
                .HasForeignKey(pi => pi.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserRating>()
                .HasOne(ur => ur.RatedUser)
                .WithMany(u => u.ReceivedRatings)
                .HasForeignKey(ur => ur.RatedUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserRating>()
                .HasOne(ur => ur.RaterUser)
                .WithMany(u => u.GivenRatings)
                .HasForeignKey(ur => ur.RaterUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.User)
                .WithMany(u => u.Favorites)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.Property)
                .WithMany(p => p.Favorites)
                .HasForeignKey(f => f.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ChatRoom>()
                .HasOne(cr => cr.Property)
                .WithMany(p => p.ChatRooms)
                .HasForeignKey(cr => cr.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChatRoom>()
                .HasOne(cr => cr.Tenant)
                .WithMany(u => u.TenantChatRooms)
                .HasForeignKey(cr => cr.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChatRoom>()
                .HasOne(cr => cr.Landlord)
                .WithMany(u => u.LandlordChatRooms)
                .HasForeignKey(cr => cr.LandlordId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChatMessage>()
                .HasOne(cm => cm.ChatRoom)
                .WithMany(cr => cr.Messages)
                .HasForeignKey(cm => cm.ChatRoomId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ChatMessage>()
                .HasOne(cm => cm.Sender)
                .WithMany(u => u.ChatMessages)
                .HasForeignKey(cm => cm.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserNotificationSetting>()
                .HasOne(uns => uns.User)
                .WithMany()
                .HasForeignKey(uns => uns.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserNotificationSetting>()
                .HasOne(uns => uns.NotificationType)
                .WithMany(nt => nt.Settings)
                .HasForeignKey(uns => uns.NotificationTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.NotificationType)
                .WithMany(nt => nt.Notifications)
                .HasForeignKey(n => n.NotificationTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SearchPreference>()
                .HasOne(sp => sp.User)
                .WithOne(u => u.SearchPreference)
                .HasForeignKey<SearchPreference>(sp => sp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EmailVerificationToken>()
                .HasOne(evt => evt.User)
                .WithMany(u => u.EmailVerificationTokens)
                .HasForeignKey(evt => evt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PasswordResetToken>()
                .HasOne(prt => prt.User)
                .WithMany(u => u.PasswordResetTokens)
                .HasForeignKey(prt => prt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AdminAuditLog>()
                .HasOne(aal => aal.Admin)
                .WithMany()
                .HasForeignKey(aal => aal.AdminId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => new { rt.UserId, rt.ExpiresAt });

            // Seed default data
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin", Description = "System administrator", CreatedAt = _seedDate, UpdatedAt = _seedDate },
                new Role { Id = 2, Name = "Landlord", Description = "Property owner", CreatedAt = _seedDate, UpdatedAt = _seedDate },
                new Role { Id = 3, Name = "Tenant", Description = "Tenant/renter", CreatedAt = _seedDate, UpdatedAt = _seedDate }
            );

            modelBuilder.Entity<PropertyCategory>().HasData(
                new PropertyCategory { Id = 1, Name = "Lakás", Description = "Lakás bérleti lehetőség", CreatedAt = _seedDate, UpdatedAt = _seedDate },
                new PropertyCategory { Id = 2, Name = "Ház", Description = "Egész ház bérleti lehetőség", CreatedAt = _seedDate, UpdatedAt = _seedDate },
                new PropertyCategory { Id = 3, Name = "Szoba", Description = "Szoba bérleti lehetőség", CreatedAt = _seedDate, UpdatedAt = _seedDate },
                new PropertyCategory { Id = 4, Name = "Garzon", Description = "Garzon lakás bérleti lehetőség", CreatedAt = _seedDate, UpdatedAt = _seedDate }
            );

            modelBuilder.Entity<NotificationType>().HasData(
                new NotificationType { Id = 1, Name = "NewMessage", Description = "New message received", DefaultEnabled = true, CreatedAt = _seedDate },
                new NotificationType { Id = 2, Name = "NewProperty", Description = "New property listed", DefaultEnabled = true, CreatedAt = _seedDate },
                new NotificationType { Id = 3, Name = "PropertyApproved", Description = "Property approved", DefaultEnabled = true, CreatedAt = _seedDate },
                new NotificationType { Id = 4, Name = "PropertyRejected", Description = "Property rejected", DefaultEnabled = true, CreatedAt = _seedDate },
                new NotificationType { Id = 5, Name = "NewRating", Description = "New rating received", DefaultEnabled = true, CreatedAt = _seedDate }
            );
        }
    }
}

