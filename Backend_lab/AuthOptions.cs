using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Backend_lab
{
    /// <summary>Настройки JWT. Берутся из секции "Jwt" в appsettings.json / user-secrets / переменных окружения.</summary>
    public class AuthOptions
    {
        public const string SectionName = "Jwt";

        public string Issuer { get; set; } = "WebAPI_App_Server";
        public string Audience { get; set; } = "WebAPI_App_Client";
        public string Key { get; set; } = string.Empty;
        public int LifetimeMinutes { get; set; } = 1440;

        public SymmetricSecurityKey GetSymmetricSecurityKey()
        {
            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Key));
        }
    }
}
