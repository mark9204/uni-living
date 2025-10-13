namespace UniLiving.DataContext.DTOs
{
    public class UserNotificationSettingDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int NotificationTypeId { get; set; }
        public bool IsEnabled { get; set; }
    }
}
