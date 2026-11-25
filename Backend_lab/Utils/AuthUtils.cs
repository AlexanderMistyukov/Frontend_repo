using System.Security.Cryptography;
using System.Text;

namespace Backend_lab.Utils
{
    public static class AuthUtils
    {
        private const string Prefix = "PBKDF2";
        private const int SaltSize = 16;
        private const int KeySize = 32;
        private const int Iterations = 100_000;

        /// <summary>Хеш с солью (PBKDF2-SHA256). Формат: PBKDF2$итерации$соль$хеш.</summary>
        public static string HashPassword(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(SaltSize);
            var key = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, KeySize);
            return $"{Prefix}${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(key)}";
        }

        /// <summary>
        /// Проверяет пароль. Понимает и новый формат, и старый (SHA-256 без соли, Base64),
        /// чтобы уже существующие пользователи в БД могли войти.
        /// </summary>
        public static bool VerifyPassword(string password, string storedHash)
        {
            if (string.IsNullOrEmpty(storedHash))
            {
                return false;
            }

            try
            {
                if (IsCurrentFormat(storedHash))
                {
                    var parts = storedHash.Split('$');
                    if (parts.Length != 4 || !int.TryParse(parts[1], out var iterations) || iterations < 1)
                    {
                        return false;
                    }

                    var salt = Convert.FromBase64String(parts[2]);
                    var expected = Convert.FromBase64String(parts[3]);
                    if (expected.Length == 0)
                    {
                        return false;
                    }

                    var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expected.Length);
                    return CryptographicOperations.FixedTimeEquals(expected, actual);
                }

                var legacyExpected = Convert.FromBase64String(storedHash);
                var legacyActual = SHA256.HashData(Encoding.UTF8.GetBytes(password));
                return CryptographicOperations.FixedTimeEquals(legacyExpected, legacyActual);
            }
            catch (FormatException)
            {
                return false;
            }
        }

        /// <summary>true, если хеш в старом формате и его стоит пересохранить при успешном входе.</summary>
        public static bool NeedsRehash(string storedHash)
        {
            return !IsCurrentFormat(storedHash);
        }

        private static bool IsCurrentFormat(string storedHash)
        {
            return storedHash.StartsWith(Prefix + "$", StringComparison.Ordinal);
        }
    }
}
