namespace Backend_lab.Utils
{
    public static class DateTimeUtils
    {
        /// <summary>
        /// Npgsql пишет в колонки "timestamp with time zone" только DateTime с Kind=Utc.
        /// Дата без часового пояса (например "2026-06-01" с формы фронтенда) иначе приводила бы к ошибке 500.
        /// Пустая дата (0001-01-01) заменяется текущим моментом.
        /// </summary>
        public static DateTime ToUtc(DateTime value)
        {
            if (value == default)
            {
                return DateTime.UtcNow;
            }

            return value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
            };
        }
    }
}
