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

        // Mapping Game <-> GameDto
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
            game.ReleaseDate = dto.ReleaseDate;
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
                return Content("Jeu non trouvé.", "text/plain; charset=utf-8");

            UpdateEntity(game, gameDto);
            _context.Entry(game).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GameExists(id))
                    return Content("Jeu non trouvé.", "text/plain; charset=utf-8");
                else
                    throw;
            }

            // Retourne la liste des jeux après modification
            var games = await _context.Games.ToListAsync();
            return Ok(games.Select(ToDto));
        }

        /// <summary>
        /// Crée un nouveau jeu.
        /// </summary>
        /// <param name="gameDto">Données du jeu</param>
        /// <returns>Message de succès</returns>
        [HttpPost]
        [Authorize]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> PostGame([FromBody] GameDto gameDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var game = new Game
            {
                Title = gameDto.Title,
                Genre = gameDto.Genre,
                Platform = gameDto.Platform,
                ReleaseDate = gameDto.ReleaseDate
            };

            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            return Content("Jeu créé avec succès !", "text/plain; charset=utf-8");
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
                return Content("Jeu non trouvé.", "text/plain; charset=utf-8");

            _context.Games.Remove(game);
            await _context.SaveChangesAsync();

            return Content("Jeu supprimé avec succès !", "text/plain; charset=utf-8");
        }

        private bool GameExists(long id)
        {
            return _context.Games.Any(e => e.Id == id);
        }
    }
}