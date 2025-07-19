using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using RetroGames.Models;

namespace RetroGames.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly string _jwtKey;

        public AuthController(IConfiguration configuration)
        {
            _jwtKey = configuration["Jwt:Key"];
        }

        /// <summary>
        /// Authentifie un utilisateur et retourne un token JWT.
        /// </summary>
        /// <remarks>
        /// Exemple de requête :
        /// 
        ///     {
        ///         "username": "test",
        ///         "password": "test123"
        ///     }
        /// </remarks>
        /// <param name="login">Identifiants de connexion</param>
        /// <returns>Token JWT si authentification réussie</returns>
        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(object))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult Login([FromBody] UserLogin login)
        {
            // Mot de passe hashé pour le compte test
            var testUser = new UserModel
            {
                Username = "test",
                PasswordHash = PasswordHelper.HashPassword("test123")
            };

            // Vérification du mot de passe
            if (login.Username == testUser.Username &&
                PasswordHelper.VerifyPassword(login.Password, testUser.PasswordHash))
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_jwtKey);

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.Name, testUser.Username)
                    }),
                    Expires = DateTime.UtcNow.AddHours(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var jwt = tokenHandler.WriteToken(token);

                return Ok(new { token = jwt });
            }

            return Unauthorized();
        }
    }
}