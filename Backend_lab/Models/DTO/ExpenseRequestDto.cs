using System.ComponentModel.DataAnnotations;

namespace Backend_lab.Models.DTO
{
    public class ExpenseRequestDto
    {
        [Range(1, int.MaxValue)]
        public int TransactionId { get; set; }

        [Required]
        [StringLength(300)]
        public string Recipient { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string ExpensePurpose { get; set; } = string.Empty;

        [Range(typeof(decimal), "0.01", "1000000000000", ParseLimitsInInvariantCulture = true, ConvertValueInInvariantCulture = true)]
        public decimal Amount { get; set; }

        public DateTime ExpenseDate { get; set; }
    }
}
