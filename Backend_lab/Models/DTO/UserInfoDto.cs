namespace Backend_lab.Models.DTO
{
    /// <summary>Пользователь для страницы администрирования (без пароля).</summary>
    public class UserInfoDto
    {
        public int Id { get; set; }
        public string Login { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
