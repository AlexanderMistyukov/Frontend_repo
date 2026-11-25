using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_lab.Models.Transactions
{
    public class TransactionFile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string SystemName { get; set; }
        public string DisplayName { get; set; }
        public string FilePath { get; set; }
        public long FileSize { get; set; }
        public DateTime UploadDate { get; set; }

        public int TransactionId { get; set; }
        public Transaction Transaction { get; set; }
    }
}