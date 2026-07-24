namespace BlogApi.DB;

public interface IDbConfiguration
{
    string GetConnectionString();
}

public class DbConfiguration : IDbConfiguration
{
    private readonly IConfiguration _configuration;

    public DbConfiguration(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GetConnectionString()
    {
        return _configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection is not configured.");
    }
}
