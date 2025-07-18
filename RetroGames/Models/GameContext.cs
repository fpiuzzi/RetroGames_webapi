using Microsoft.EntityFrameworkCore;
using RetroGames.Dto;

namespace RetroGames.Models
{
    public class GameContext : DbContext
    {
        public GameContext(DbContextOptions<GameContext> options)
            : base(options)
        {
        }

        public DbSet<Game> Games { get; set; }
        public DbSet<UserModel> Users { get; set; }
        public DbSet<RetroGames.Dto.GameDto> GameDto { get; set; } = default!;
    }
}
