namespace UniLiving.DataContext.DTOs
{
    public class DashboardStatsDto
    {
    }

    public class LandlordDashboardDto
    {
        public int TotalAdViews { get; set; }
        public int UnreadMessages { get; set; }
        public int ActiveListings { get; set; }
    }

    public class TenantDashboardDto
    {
        public int NewNotifications { get; set; }
        public int UnreadMessages { get; set; }
        public int SavedFavorites { get; set; }
    }
}