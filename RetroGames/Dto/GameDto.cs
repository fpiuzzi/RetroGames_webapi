namespace RetroGames.Dto
{
    public class GameDto
    {
        public long Id { get; internal set; }
        public string Title { get; internal set; }
        public string Genre { get; internal set; }
        public string Platform { get; internal set; }
        public DateTime ReleaseDate { get; internal set; }
    }
}
