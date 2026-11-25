using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Backend_lab.Models.DTO
{
    /// <summary>Загрузка файла через multipart/form-data (обычная форма / FormData на фронтенде).</summary>
    public class UploadFileFormDto
    {
        [Required]
        public IFormFile File { get; set; } = null!;

        [Range(1, int.MaxValue)]
        public int TransactionId { get; set; }
    }
}
