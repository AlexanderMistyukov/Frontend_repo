using Backend_lab.DbContexts;
using Backend_lab.Models.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_lab.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize(Roles = "admin")]
    public class AdministrationController : ControllerBase
    {
        private static readonly string[] AllowedRoles = { "admin", "manager", "user" };

        private readonly ApplicationContext _context;

        public AdministrationController(ApplicationContext context)
        {
            _context = context;
        }

        /// <summary>GET: /administration/users - список пользователей (admin).</summary>
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .AsNoTracking()
                .OrderBy(u => u.Id)
                .Select(u => new UserInfoDto
                {
                    Id = u.Id,
                    Login = u.Login,
                    Role = u.Role
                })
                .ToListAsync();

            return Ok(users);
        }

        /// <summary>
        /// PUT: /administration/userrole - назначить роль пользователю (admin).
        /// Собственную роль изменить нельзя, чтобы случайно не лишить систему администратора.
        /// Новая роль попадёт в токен только после следующего входа пользователя.
        /// </summary>
        [HttpPut("userrole")]
        public async Task<IActionResult> SetUserRole([FromBody] SetUserRoleRequestDto request)
        {
            var role = request.Role.Trim().ToLowerInvariant();
            if (!AllowedRoles.Contains(role))
            {
                return BadRequest(new { errorText = $"Недопустимая роль. Допустимые значения: {string.Join(", ", AllowedRoles)}" });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId);
            if (user == null)
            {
                return NotFound(new { errorText = "Пользователь не найден" });
            }

            var currentUserId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            if (user.Id.ToString() == currentUserId)
            {
                return BadRequest(new { errorText = "Нельзя изменить собственную роль" });
            }

            user.Role = role;
            await _context.SaveChangesAsync();

            return Ok(new { userId = user.Id, role = user.Role, message = "Роль пользователя изменена" });
        }
    }
}
