using BlogApi.Models;

namespace BlogApi.Interfaces.Core;

public interface ITokenService
{
    string GenerateToken(User user, DateTime expiresAt);
}
