using System.ComponentModel.DataAnnotations;

namespace RetroGames.Dto
{
    public class GameDto
    {
        public long Id { get; set; }

        [Required(ErrorMessage = "Le nom du jeu est obligatoire.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Le genre du jeu est obligatoire.")]
        public string Genre { get; set; }

        [Required(ErrorMessage = "Le nom de la plateforme du jeu est obligatoire.")]
        public string Platform { get; set; }

        [Range(typeof(DateTime), "1950-01-01", "2020-12-31", ErrorMessage = "La date doit être comprise entre 1950 et 2020 sinon c'est pas un jeu rétro")]
        public DateTime? ReleaseDate { get; set; }
    }
}
