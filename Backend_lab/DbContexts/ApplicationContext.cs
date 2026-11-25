using Microsoft.EntityFrameworkCore;
using Backend_lab.Models.Users;
using Backend_lab.Models.Categories;
using Backend_lab.Models.Transactions;

namespace Backend_lab.DbContexts
{
    public class ApplicationContext : DbContext
    {
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Transaction> Transactions { get; set; } = null!;
        public DbSet<Income> Incomes { get; set; } = null!;
        public DbSet<Expense> Expenses { get; set; } = null!;
        public DbSet<TransactionFile> TransactionFiles { get; set; } = null!;

        // Контекст создаётся через DI (AddDbContext в Program.cs), строка подключения - в appsettings.json
        public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options) { }
    }
}
