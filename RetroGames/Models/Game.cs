namespace RetroGames.Models
{
    public class Game
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public string Genre { get; set; }
        public string Platform { get; set; }
        public DateTime ReleaseDate { get; set; }
    }
}
