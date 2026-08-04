namespace BlogApi.DTOs;

public class DashboardStatsDto
{
    public int TotalPosts { get; set; }
    public int PublicPosts { get; set; }
    public int FriendsOnlyPosts { get; set; }
    public int PrivatePosts { get; set; }
    public int FriendsCount { get; set; }
    public int PendingRequests { get; set; }
    public int ReceivedRequests { get; set; }
}
