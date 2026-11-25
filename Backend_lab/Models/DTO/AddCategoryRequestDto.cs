using System.ComponentModel.DataAnnotations;

namespace Backend_lab.Models.DTO
{
    public class AddCategoryRequestDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }
    }
}
