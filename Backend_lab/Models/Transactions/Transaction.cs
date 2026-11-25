namespace Backend_lab.Models.Transactions
{
    public class Transaction
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Counterparty { get; set; }
        public string Notes { get; set; }

        public List<Income> Incomes { get; set; }
        public List<Expense> Expenses { get; set; }
        public List<TransactionFile> Files { get; set; } = new List<TransactionFile>();
    }
}