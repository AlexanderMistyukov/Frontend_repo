using System.ComponentModel.DataAnnotations;

namespace Backend_lab.Models.DTO
{
    public class SetUserRoleRequestDto
    {
        [Range(1, int.MaxValue)]
        public int UserId { get; set; }

        /// <summary>Одна из ролей: admin, manager, user.</summary>
        [Required]
        public string Role { get; set; } = string.Empty;
    }
}
