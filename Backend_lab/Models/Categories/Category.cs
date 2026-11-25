using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend_lab.Models.Transactions;

namespace Backend_lab.Models.Categories
{
    public class Category
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string Name { get; set; }          
        public string Description { get; set; }   

        public List<Transaction> Transactions { get; set; }  
    }
}