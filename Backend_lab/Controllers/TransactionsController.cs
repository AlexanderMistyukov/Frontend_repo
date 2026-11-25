using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend_lab.DbContexts;
using Backend_lab.Models.Transactions;
using Backend_lab.Models.DTO;
using Backend_lab.Services;
using Backend_lab.Utils;
using Microsoft.EntityFrameworkCore;

namespace Backend_lab.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly ApplicationContext _context;
        private readonly FileStorage _fileStorage;

        public TransactionsController(ApplicationContext context, FileStorage fileStorage)
        {
            _context = context;
            _fileStorage = fileStorage;
        }

        /// <summary>
        /// GET: /transactions/transactions - список всех транзакций (новые сверху) с доходами, расходами и файлами.
        /// Доступно любому авторизованному пользователю.
        /// </summary>
        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            var transactions = await _context.Transactions
                .AsNoTracking()
                .OrderByDescending(t => t.TransactionDate)
                .ThenByDescending(t => t.Id)
                .Select(TransactionMappings.ToResponse)
                .ToListAsync();

            return Ok(transactions);
        }

        /// <summary>
        /// GET: /transactions/transaction/{id} - одна транзакция по ID.
        /// Доступно любому авторизованному пользователю.
        /// </summary>
        [HttpGet("transaction/{id}")]
        public async Task<IActionResult> GetTransactionById(int id)
        {
            var transaction = await _context.Transactions
                .AsNoTracking()
                .Where(t => t.Id == id)
                .Select(TransactionMappings.ToResponse)
                .FirstOrDefaultAsync();

            if (transaction == null)
            {
                return NotFound(new { errorText = "Транзакция не найдена" });
            }

            return Ok(transaction);
        }

        /// <summary>POST: /transactions/transaction - создать транзакцию в категории (admin, manager).</summary>
        [HttpPost("transaction")]
        [Authorize(Roles = "admin,manager")]
        public async Task<IActionResult> CreateTransaction([FromBody] TransactionRequestDto transactionDto)
        {
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == transactionDto.CategoryId);
            if (category == null)
            {
                return BadRequest(new { errorText = "Категория не найдена" });
            }

            var transaction = new Transaction
            {
                Title = transactionDto.Title.Trim(),
                Amount = transactionDto.Amount,
                TransactionDate = DateTimeUtils.ToUtc(transactionDto.TransactionDate),
                Counterparty = transactionDto.Counterparty.Trim(),
                Notes = transactionDto.Notes?.Trim() ?? string.Empty
            };

            // Одно сохранение вместо двух: транзакция и привязка к категории записываются атомарно
            category.Transactions ??= new List<Transaction>();
            category.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(new { transactionId = transaction.Id, message = "Транзакция успешно создана" });
        }

        /// <summary>PUT: /transactions/transaction?id= - обновить транзакцию, в том числе сменить категорию (admin).</summary>
        [HttpPut("transaction")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateTransaction(int id, [FromBody] TransactionRequestDto transactionDto)
        {
            var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == id);
            if (transaction == null)
            {
                return NotFound(new { errorText = "Транзакция не найдена" });
            }

            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == transactionDto.CategoryId);
            if (category == null)
            {
                return BadRequest(new { errorText = "Категория не найдена" });
            }

            transaction.Title = transactionDto.Title.Trim();
            transaction.Amount = transactionDto.Amount;
            transaction.TransactionDate = DateTimeUtils.ToUtc(transactionDto.TransactionDate);
            transaction.Counterparty = transactionDto.Counterparty.Trim();
            transaction.Notes = transactionDto.Notes?.Trim() ?? string.Empty;

            // CategoryId из DTO раньше молча игнорировался. Добавление в коллекцию новой категории переносит транзакцию в неё.
            category.Transactions ??= new List<Transaction>();
            category.Transactions.Add(transaction);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Транзакция успешно обновлена" });
        }

        /// <summary>
        /// DELETE: /transactions/transaction?id= - удалить транзакцию вместе с её доходами, расходами и файлами (admin).
        /// </summary>
        [HttpDelete("transaction")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var transaction = await _context.Transactions
                .Include(t => t.Incomes)
                .Include(t => t.Expenses)
                .Include(t => t.Files)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (transaction == null)
            {
                return NotFound(new { errorText = "Транзакция не найдена" });
            }

            // Внешние ключи Incomes/Expenses в БД без каскада: раньше удаление транзакции с доходами или расходами давало 500
            var systemNames = transaction.Files.Select(f => f.SystemName).ToList();

            _context.Incomes.RemoveRange(transaction.Incomes);
            _context.Expenses.RemoveRange(transaction.Expenses);
            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            // файлы удаляем с диска только после успешного удаления из БД (записи TransactionFiles удаляются каскадом)
            foreach (var systemName in systemNames)
            {
                _fileStorage.DeleteIfExists(systemName);
            }

            return Ok(new { message = "Транзакция успешно удалена" });
        }

        /// <summary>
        /// POST: /transactions/income - добавить поступление средств (admin, manager). Возвращает остаток по транзакции.
        /// </summary>
        [HttpPost("income")]
        [Authorize(Roles = "admin,manager")]
        public async Task<IActionResult> AddIncome([FromBody] IncomeRequestDto incomeDto)
        {
            var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == incomeDto.TransactionId);
            if (transaction == null)
            {
                return BadRequest(new { errorText = "Транзакция не найдена" });
            }

            var income = new Income
            {
                Source = incomeDto.Source.Trim(),
                Purpose = incomeDto.Purpose.Trim(),
                Amount = incomeDto.Amount,
                IncomeDate = DateTimeUtils.ToUtc(incomeDto.IncomeDate)
            };

            transaction.Incomes ??= new List<Income>();
            transaction.Incomes.Add(income);
            await _context.SaveChangesAsync();

            var balance = await GetBalanceAsync(transaction.Id);

            return Ok(new
            {
                incomeId = income.Id,
                balance = balance,
                message = $"Доход {incomeDto.Amount}₽ добавлен. Остаток по транзакции: {balance}₽"
            });
        }

        /// <summary>DELETE: /transactions/income?id= - удалить поступление (admin). Возвращает остаток по транзакции.</summary>
        [HttpDelete("income")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteIncome(int id)
        {
            var income = await _context.Incomes.FirstOrDefaultAsync(i => i.Id == id);
            if (income == null)
            {
                return NotFound(new { errorText = "Информация о поступлении не найдена" });
            }

            var transactionId = await _context.Transactions
                .Where(t => t.Incomes.Any(i => i.Id == id))
                .Select(t => (int?)t.Id)
                .FirstOrDefaultAsync();

            _context.Incomes.Remove(income);
            await _context.SaveChangesAsync();

            decimal balance = 0;
            if (transactionId != null)
            {
                balance = await GetBalanceAsync(transactionId.Value);
            }

            return Ok(new
            {
                balance = balance,
                message = $"Доход {income.Amount}₽ удалён. Остаток по транзакции: {balance}₽"
            });
        }

        /// <summary>
        /// POST: /transactions/expense - добавить расход (admin, manager). Возвращает остаток по транзакции.
        /// </summary>
        [HttpPost("expense")]
        [Authorize(Roles = "admin,manager")]
        public async Task<IActionResult> AddExpense([FromBody] ExpenseRequestDto expenseDto)
        {
            var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == expenseDto.TransactionId);
            if (transaction == null)
            {
                return BadRequest(new { errorText = "Транзакция не найдена" });
            }

            var expense = new Expense
            {
                Recipient = expenseDto.Recipient.Trim(),
                ExpensePurpose = expenseDto.ExpensePurpose.Trim(),
                Amount = expenseDto.Amount,
                ExpenseDate = DateTimeUtils.ToUtc(expenseDto.ExpenseDate)
            };

            transaction.Expenses ??= new List<Expense>();
            transaction.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            var balance = await GetBalanceAsync(transaction.Id);

            return Ok(new
            {
                expenseId = expense.Id,
                balance = balance,
                message = $"Расход {expenseDto.Amount}₽ добавлен. Остаток по транзакции: {balance}₽"
            });
        }

        /// <summary>DELETE: /transactions/expense?id= - удалить расход (admin). Возвращает остаток по транзакции.</summary>
        [HttpDelete("expense")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id);
            if (expense == null)
            {
                return NotFound(new { errorText = "Информация о расходовании не найдена" });
            }

            var transactionId = await _context.Transactions
                .Where(t => t.Expenses.Any(e => e.Id == id))
                .Select(t => (int?)t.Id)
                .FirstOrDefaultAsync();

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            decimal balance = 0;
            if (transactionId != null)
            {
                balance = await GetBalanceAsync(transactionId.Value);
            }

            return Ok(new
            {
                balance = balance,
                message = $"Расход {expense.Amount}₽ удалён. Остаток по транзакции: {balance}₽"
            });
        }

        /// <summary>
        /// GET: /transactions/statistics - общая статистика и разбивка по категориям.
        /// TotalBalance - общий остаток (все поступления минус все расходы), TransactionsAmount - сумма поля Amount всех транзакций.
        /// Доступно любому авторизованному пользователю.
        /// </summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            var totalTransactionsAmount = await _context.Transactions.SumAsync(t => t.Amount);
            var totalIncomeAmount = await _context.Incomes.SumAsync(i => i.Amount);
            var totalExpenseAmount = await _context.Expenses.SumAsync(e => e.Amount);
            var transactionsCount = await _context.Transactions.CountAsync();
            var incomesCount = await _context.Incomes.CountAsync();
            var expensesCount = await _context.Expenses.CountAsync();

            var perTransaction = await _context.Transactions
                .AsNoTracking()
                .Select(t => new
                {
                    CategoryId = EF.Property<int?>(t, "CategoryId"),
                    t.Amount,
                    IncomesSum = t.Incomes.Sum(i => i.Amount),
                    ExpensesSum = t.Expenses.Sum(e => e.Amount)
                })
                .ToListAsync();

            var categories = await _context.Categories
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new { c.Id, c.Name })
                .ToListAsync();

            var categoriesStats = categories.Select(c => new
            {
                CategoryName = c.Name,
                TotalAmount = perTransaction.Where(t => t.CategoryId == c.Id).Sum(t => t.Amount),
                TransactionsCount = perTransaction.Count(t => t.CategoryId == c.Id),
                IncomesSum = perTransaction.Where(t => t.CategoryId == c.Id).Sum(t => t.IncomesSum),
                ExpensesSum = perTransaction.Where(t => t.CategoryId == c.Id).Sum(t => t.ExpensesSum),
                Balance = perTransaction.Where(t => t.CategoryId == c.Id).Sum(t => t.IncomesSum)
                          - perTransaction.Where(t => t.CategoryId == c.Id).Sum(t => t.ExpensesSum)
            }).ToList();

            return Ok(new
            {
                TotalBalance = totalIncomeAmount - totalExpenseAmount,
                TotalIncome = totalIncomeAmount,
                TotalExpense = totalExpenseAmount,
                TransactionsAmount = totalTransactionsAmount,
                TransactionsCount = transactionsCount,
                IncomesCount = incomesCount,
                ExpensesCount = expensesCount,
                CategoriesStats = categoriesStats
            });
        }

        /// <summary>Остаток по транзакции = сумма её поступлений минус сумма её расходов.</summary>
        private async Task<decimal> GetBalanceAsync(int transactionId)
        {
            var incomes = await _context.Transactions
                .Where(t => t.Id == transactionId)
                .SelectMany(t => t.Incomes)
                .SumAsync(i => i.Amount);

            var expenses = await _context.Transactions
                .Where(t => t.Id == transactionId)
                .SelectMany(t => t.Expenses)
                .SumAsync(e => e.Amount);

            return incomes - expenses;
        }
    }
}
