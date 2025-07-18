using System.ComponentModel.DataAnnotations;

namespace RetroGames.Dto
{
    public class GameDto
    {
        public long Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Genre { get; set; }

        [Required]
        public string Platform { get; set; }

        public DateTime ReleaseDate { get; set; }
    }
}
