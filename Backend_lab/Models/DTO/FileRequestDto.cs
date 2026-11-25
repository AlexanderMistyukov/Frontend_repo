using System.ComponentModel.DataAnnotations;

namespace Backend_lab.Models.DTO
{
    /// <summary>Загрузка файла в виде Base64-строки (JSON).</summary>
    public class FileRequestDto
    {
        [Required]
        [StringLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        public string FileContentBase64 { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int TransactionId { get; set; }
    }
}
