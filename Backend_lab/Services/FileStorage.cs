namespace Backend_lab.Services
{
    /// <summary>
    /// Хранилище загруженных файлов. Путь всегда строится из SystemName и папки приложения,
    /// а не берётся из БД: абсолютные пути вида D:\... ломаются при переносе на другой компьютер.
    /// </summary>
    public class FileStorage
    {
        public const string FolderName = "TransactionFiles";

        private readonly string _directory;

        public FileStorage(IWebHostEnvironment environment)
        {
            _directory = Path.Combine(environment.ContentRootPath, FolderName);
            Directory.CreateDirectory(_directory);
        }

        public string GetFullPath(string systemName)
        {
            // GetFileName отбрасывает любые части пути - защита от выхода за пределы папки
            return Path.Combine(_directory, Path.GetFileName(systemName));
        }

        public async Task SaveAsync(string systemName, byte[] content)
        {
            await File.WriteAllBytesAsync(GetFullPath(systemName), content);
        }

        public async Task SaveAsync(string systemName, IFormFile file)
        {
            await using var stream = new FileStream(GetFullPath(systemName), FileMode.CreateNew, FileAccess.Write);
            await file.CopyToAsync(stream);
        }

        public void DeleteIfExists(string systemName)
        {
            try
            {
                var path = GetFullPath(systemName);
                if (File.Exists(path))
                {
                    File.Delete(path);
                }
            }
            catch (IOException)
            {
                // запись в БД уже удалена (или файл не нужен) - занятый файл на диске не должен превращаться в ошибку 500
            }
            catch (UnauthorizedAccessException)
            {
            }
        }
    }
}
