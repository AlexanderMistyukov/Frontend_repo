using Backend_lab.DbContexts;
using Backend_lab.Models.DTO;
using Backend_lab.Models.Users;
using Backend_lab.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Backend_lab.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationContext _context;
        private readonly AuthOptions _authOptions;

        public AuthController(ApplicationContext context, IOptions<AuthOptions> authOptions)
        {
            _context = context;
            _authOptions = authOptions.Value;
        }

        /// <summary>POST /register - регистрация (всегда с ролью user).</summary>
        [HttpPost("/register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerDto)
        {
            var login = registerDto.Login.Trim();

            if (await _context.Users.AnyAsync(u => u.Login == login))
            {
                return BadRequest(new { errorText = "Пользователь с таким логином уже существует" });
            }

            var user = new User
            {
                Login = login,
                Password = AuthUtils.HashPassword(registerDto.Password),
                Role = "user"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { userId = user.Id, message = "Пользователь успешно зарегистрирован" });
        }

        /// <summary>POST /login - вход, возвращает JWT.</summary>
        [HttpPost("/login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto)
        {
            var username = loginDto.Username.Trim();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == username);
            if (user == null || !AuthUtils.VerifyPassword(loginDto.Password, user.Password))
            {
                return BadRequest(new { errorText = "Неверный логин или пароль" });
            }

            // Пароль в старом формате (SHA-256 без соли) тихо переводим на PBKDF2 с солью
            if (AuthUtils.NeedsRehash(user.Password))
            {
                user.Password = AuthUtils.HashPassword(loginDto.Password);
                await _context.SaveChangesAsync();
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimsIdentity.DefaultNameClaimType, user.Login),
                new Claim(ClaimsIdentity.DefaultRoleClaimType, user.Role),
                new Claim("UserId", user.Id.ToString())
            };

            var now = DateTime.UtcNow;
            var jwt = new JwtSecurityToken(
                issuer: _authOptions.Issuer,
                audience: _authOptions.Audience,
                notBefore: now,
                claims: claims,
                expires: now.AddMinutes(_authOptions.LifetimeMinutes),
                signingCredentials: new SigningCredentials(_authOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256));

            var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

            // Возвращаем объект, а не заранее сериализованную строку: иначе ответ получается строкой с JSON внутри
            return Ok(new
            {
                access_token = encodedJwt,
                username = user.Login,
                role = user.Role,
                expires_in = _authOptions.LifetimeMinutes * 60
            });
        }

        /// <summary>GET /me - данные текущего пользователя по токену.</summary>
        [HttpGet("/me")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            var username = User.Identity?.Name;
            var role = User.Claims.FirstOrDefault(c => c.Type == ClaimsIdentity.DefaultRoleClaimType)?.Value;
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            return Ok(new
            {
                username = username,
                role = role,
                userId = userId,
                isAuthenticated = User.Identity?.IsAuthenticated ?? false
            });
        }
    }
}
