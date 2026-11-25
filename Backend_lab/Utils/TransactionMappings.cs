using System.Linq.Expressions;
using Backend_lab.Models.DTO;
using Backend_lab.Models.Transactions;
using Microsoft.EntityFrameworkCore;

namespace Backend_lab.Utils
{
    public static class TransactionMappings
    {
        /// <summary>Единая проекция Transaction -> TransactionResponseDto (транслируется в SQL).</summary>
        public static readonly Expression<Func<Transaction, TransactionResponseDto>> ToResponse = t => new TransactionResponseDto
        {
            Id = t.Id,
            CategoryId = EF.Property<int?>(t, "CategoryId"),
            Title = t.Title,
            Amount = t.Amount,
            TransactionDate = t.TransactionDate,
            Counterparty = t.Counterparty,
            Notes = t.Notes,
            Incomes = t.Incomes.Select(i => new IncomeDto
            {
                Id = i.Id,
                Source = i.Source,
                Purpose = i.Purpose,
                Amount = i.Amount,
                IncomeDate = i.IncomeDate
            }).ToList(),
            Expenses = t.Expenses.Select(e => new ExpenseDto
            {
                Id = e.Id,
                Recipient = e.Recipient,
                ExpensePurpose = e.ExpensePurpose,
                Amount = e.Amount,
                ExpenseDate = e.ExpenseDate
            }).ToList(),
            Files = t.Files.Select(f => new TransactionFileDto
            {
                Id = f.Id,
                DisplayName = f.DisplayName,
                SystemName = f.SystemName,
                FileSize = f.FileSize,
                UploadDate = f.UploadDate
            }).ToList()
        };
    }
}
