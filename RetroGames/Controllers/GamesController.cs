using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetroGames.Models;
using RetroGames.Dto;
using Microsoft.AspNetCore.Authorization;

namespace RetroGames.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GamesController : ControllerBase
    {
        private readonly GameContext _context;

        public GamesController(GameContext context)
        {
            _context = context;
        }

        private static GameDto ToDto(Game game) => new GameDto
        {
            Id = game.Id,
            Title = game.Title,
            Genre = game.Genre,
            Platform = game.Platform,
            ReleaseDate = game.ReleaseDate
        };

        private static void UpdateEntity(Game game, GameDto dto)
        {
            game.Title = dto.Title;
            game.Genre = dto.Genre;
            game.Platform = dto.Platform;
            if (dto.ReleaseDate.HasValue)
                game.ReleaseDate = dto.ReleaseDate.Value;
        }

        /// <summary>
        /// Récupère la liste complète des jeux.
        /// </summary>
        /// <returns>Liste des jeux</returns>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<GameDto>), 200)]
        public async Task<ActionResult<IEnumerable<GameDto>>> GetGames()
        {
            var games = await _context.Games.ToListAsync();
            return Ok(games.Select(ToDto));
        }

        /// <summary>
        /// Récupère un jeu par son identifiant.
        /// </summary>
        /// <param name="id">Identifiant du jeu</param>
        /// <returns>Le jeu demandé</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(GameDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<GameDto>> GetGame(long id)
        {
            var game = await _context.Games.FindAsync(id);
            if (game == null)
                return NotFound();
            return Ok(ToDto(game));
        }

        /// <summary>
        /// Filtre les jeux par plateforme, genre ou date de sortie.
        /// </summary>
        /// <remarks>
        /// Exemple d'appel :
        ///     GET /api/games/filter?platform=NES&genre=Plateforme&releaseDate=1985-09-13
        /// </remarks>
        /// <param name="platform">Plateforme du jeu (optionnel)</param>
        /// <param name="genre">Genre du jeu (optionnel)</param>
        /// <param name="releaseDate">Date de sortie du jeu (optionnel)</param>
        /// <returns>Liste filtrée des jeux</returns>
        [HttpGet("filter")]
        [ProducesResponseType(typeof(IEnumerable<GameDto>), 200)]
        public async Task<ActionResult<IEnumerable<GameDto>>> FilterGames(
            [FromQuery] string? platform,
            [FromQuery] string? genre,
            [FromQuery] DateTime? releaseDate)
        {
            var query = _context.Games.AsQueryable();

            if (!string.IsNullOrWhiteSpace(platform))
                query = query.Where(g => g.Platform == platform);

            if (!string.IsNullOrWhiteSpace(genre))
                query = query.Where(g => g.Genre == genre);

            if (releaseDate.HasValue)
                query = query.Where(g => g.ReleaseDate.HasValue && g.ReleaseDate.Value.Date == releaseDate.Value.Date);

            var result = await query.ToListAsync();
            return Ok(result.Select(ToDto));
        }

        /// <summary>
        /// Modifie un jeu existant.
        /// </summary>
        /// <param name="id">Identifiant du jeu</param>
        /// <param name="gameDto">Données du jeu</param>
        /// <returns>Message de succès ou d'erreur</returns>
        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> PutGame(long id, [FromBody] GameDto gameDto)
        {
            if (id != gameDto.Id)
                return BadRequest("L'identifiant de l'URL ne correspond pas à celui du jeu.");

            var game = await _context.Games.FindAsync(id);
            if (game == null)
                return NotFound("Jeu non trouvé.");

            UpdateEntity(game, gameDto);
            _context.Entry(game).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GameExists(id))
                    return NotFound("Jeu non trouvé.");
                else
                    throw;
            }

            return Ok(ToDto(game));
        }

        /// <summary>
        /// Crée un nouveau jeu. La date de sortie est optionnelle : si elle n'est pas renseignée, le champ restera vide.
        /// </summary>
        /// <remarks>
        /// Exemple de requête :
        /// 
        ///     {
        ///         "title": "Super Mario Bros",
        ///         "genre": "Plateforme",
        ///         "platform": "NES",
        ///         "releaseDate": "1985-09-13T00:00:00"
        ///     }
        /// La propriété "releaseDate" peut être omise ou laissée vide.
        /// </remarks>
        /// <param name="gameDto">Jeu à ajouter</param>
        /// <returns>Le jeu créé</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(GameDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<GameDto>> PostGame([FromBody] GameDto gameDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var game = new Game();
            UpdateEntity(game, gameDto);

            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGame), new { id = game.Id }, ToDto(game));
        }

        /// <summary>
        /// Supprime un jeu par son identifiant.
        /// </summary>
        /// <param name="id">Identifiant du jeu</param>
        /// <returns>Message de succès ou d'erreur</returns>
        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteGame(long id)
        {
            var game = await _context.Games.FindAsync(id);
            if (game == null)
                return NotFound("Jeu non trouvé.");

            _context.Games.Remove(game);
            await _context.SaveChangesAsync();

            return Ok("Jeu supprimé avec succès !");
        }

        private bool GameExists(long id)
        {
            return _context.Games.Any(e => e.Id == id);
        }
    }
}