using System.ComponentModel.DataAnnotations;

namespace Backend_lab.Models.DTO
{
    public class UpdateCategoryRequestDto
    {
        [Range(1, int.MaxValue)]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }
    }
}
