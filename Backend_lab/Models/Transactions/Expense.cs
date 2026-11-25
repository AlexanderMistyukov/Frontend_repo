using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_lab.Models.Transactions
{
    public class Expense
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string Recipient { get; set; }        
        public string ExpensePurpose { get; set; }    
        public decimal Amount { get; set; }           
        public DateTime ExpenseDate { get; set; }     
    }
}