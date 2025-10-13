namespace UniLiving.DataContext.DTOs
{
    public class NotificationTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool DefaultEnabled { get; set; }
    }
}
