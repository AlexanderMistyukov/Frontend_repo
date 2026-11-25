namespace Backend_lab.Models.DTO
{
    public class TransactionResponseDto
    {
        public int Id { get; set; }
        public int? CategoryId { get; set; }
        public string Title { get; set; } = string.Empty;
        /// <summary>Сумма самой операции. Не меняется при добавлении доходов и расходов.</summary>
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Counterparty { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public List<IncomeDto> Incomes { get; set; } = new();
        public List<ExpenseDto> Expenses { get; set; } = new();
        public List<TransactionFileDto> Files { get; set; } = new();

        // Считаются из уже загруженных списков доходов и расходов (в SQL не транслируются)
        public decimal TotalIncome => Incomes.Sum(i => i.Amount);
        public decimal TotalExpense => Expenses.Sum(e => e.Amount);
        /// <summary>Остаток средств по транзакции: все поступления минус все расходы.</summary>
        public decimal Balance => TotalIncome - TotalExpense;
    }

    public class IncomeDto
    {
        public int Id { get; set; }
        public string Source { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime IncomeDate { get; set; }
    }

    public class ExpenseDto
    {
        public int Id { get; set; }
        public string Recipient { get; set; } = string.Empty;
        public string ExpensePurpose { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; }
    }

    public class TransactionFileDto
    {
        public int Id { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string SystemName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadDate { get; set; }
    }
}
