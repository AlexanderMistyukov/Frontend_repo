using System.ComponentModel.DataAnnotations;

namespace Backend_lab.Models.DTO
{
    public class DownloadFileRequestDto
    {
        /// <summary>Системное имя файла (SystemName). Допускается и исходное имя, если оно единственное.</summary>
        [Required]
        public string FileName { get; set; } = string.Empty;
    }
}
