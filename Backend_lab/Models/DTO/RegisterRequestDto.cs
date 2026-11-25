using System.ComponentModel.DataAnnotations;

namespace Backend_lab.Models.DTO
{
    public class RegisterRequestDto
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string Login { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 4)]
        public string Password { get; set; } = string.Empty;
    }
}
