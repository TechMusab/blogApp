using BlogApi.DTOs;

namespace BlogApi.Interfaces.Users;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync(int userId);
}
