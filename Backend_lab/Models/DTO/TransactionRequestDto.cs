using System.ComponentModel.DataAnnotations;

namespace Backend_lab.Models.DTO
{
    public class TransactionRequestDto
    {
        [Range(1, int.MaxValue)]
        public int CategoryId { get; set; }

        [Required]
        [StringLength(300)]
        public string Title { get; set; } = string.Empty;

        [Range(typeof(decimal), "0", "1000000000000", ParseLimitsInInvariantCulture = true, ConvertValueInInvariantCulture = true)]
        public decimal Amount { get; set; }

        public DateTime TransactionDate { get; set; }

        [Required]
        [StringLength(300)]
        public string Counterparty { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Notes { get; set; }
    }
}
