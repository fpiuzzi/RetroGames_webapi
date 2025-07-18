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
        /// Pour récupérer le token d'un utilisateur
        /// </summary>
        /// <param name="login"></param>
        /// <returns></returns>

        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLogin login)
        {
            var testUser = new UserModel
            {
                Username = "test",
                Password = "test123"
            };

            if (login.Username == testUser.Username && login.Password == testUser.Password)
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