using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_lab.Models.Transactions
{
    public class Income
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string Source { get; set; }        
        public string Purpose { get; set; }       
        public decimal Amount { get; set; }       
        public DateTime IncomeDate { get; set; }  
    }
}