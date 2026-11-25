using Backend_lab.DbContexts;
using Backend_lab.Models.Categories;
using Backend_lab.Models.DTO;
using Backend_lab.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_lab.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationContext _context;

        public CategoriesController(ApplicationContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET /categories - категории вместе с их транзакциями.
        /// Доступно любому авторизованному пользователю (admin, manager, user).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new { c.Id, c.Name, c.Description })
                .ToListAsync();

            var transactions = await _context.Transactions
                .AsNoTracking()
                .OrderByDescending(t => t.TransactionDate)
                .ThenByDescending(t => t.Id)
                .Select(TransactionMappings.ToResponse)
                .ToListAsync();

            var result = categories.Select(c => new
            {
                c.Id,
                c.Name,
                c.Description,
                Transactions = transactions.Where(t => t.CategoryId == c.Id).ToList()
            });

            return Ok(result);
        }

        /// <summary>POST /categories/category - создать категорию (admin).</summary>
        [HttpPost("category")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> AddCategory([FromBody] AddCategoryRequestDto request)
        {
            var category = new Category
            {
                Name = request.Name.Trim(),
                // колонка Description в БД NOT NULL, а в DTO описание необязательное
                Description = request.Description?.Trim() ?? string.Empty
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new { categoryId = category.Id, message = "Категория успешно создана" });
        }

        /// <summary>PUT /categories/category - изменить категорию (admin).</summary>
        [HttpPut("category")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateCategory([FromBody] UpdateCategoryRequestDto request)
        {
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == request.Id);
            if (category == null)
            {
                return NotFound(new { errorText = "Категория не найдена" });
            }

            category.Name = request.Name.Trim();
            category.Description = request.Description?.Trim() ?? string.Empty;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Категория успешно обновлена" });
        }

        /// <summary>DELETE /categories/category?id= - удалить категорию (admin). Нельзя, если в ней есть транзакции.</summary>
        [HttpDelete("category")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Transactions)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new { errorText = "Категория не найдена" });
            }

            // Внешний ключ в БД без каскада: раньше здесь получали необработанную ошибку 500
            if (category.Transactions != null && category.Transactions.Count > 0)
            {
                return Conflict(new { errorText = "Нельзя удалить категорию: в ней есть транзакции. Сначала перенесите или удалите их." });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Категория успешно удалена" });
        }
    }
}
