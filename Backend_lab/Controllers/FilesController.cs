using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Backend_lab.DbContexts;
using Backend_lab.Models.DTO;
using Backend_lab.Models.Transactions;
using Backend_lab.Services;

namespace Backend_lab.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class FilesController : ControllerBase
    {
        private const long MaxFileSize = 10 * 1024 * 1024;          // 10 МБ на файл
        private const long MaxRequestSize = 15 * 1024 * 1024;       // запас под Base64 / multipart

        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".pdf", ".txt", ".png", ".jpg", ".jpeg", ".doc", ".docx", ".xls", ".xlsx", ".csv"
        };

        private static readonly FileExtensionContentTypeProvider ContentTypes = new();

        private readonly ApplicationContext _context;
        private readonly FileStorage _storage;

        public FilesController(ApplicationContext context, FileStorage storage)
        {
            _context = context;
            _storage = storage;
        }

        /// <summary>
        /// POST: /files/upload - загрузка файла в виде Base64 (JSON) и привязка к транзакции (admin, manager).
        /// </summary>
        [HttpPost("upload")]
        [Authorize(Roles = "admin,manager")]
        [RequestSizeLimit(MaxRequestSize)]
        public async Task<IActionResult> UploadFile([FromBody] FileRequestDto fileDto)
        {
            byte[] fileBytes;
            try
            {
                fileBytes = Convert.FromBase64String(fileDto.FileContentBase64);
            }
            catch (FormatException)
            {
                return BadRequest(new { errorText = "Содержимое файла не является корректной строкой Base64" });
            }

            return await StoreFileAsync(
                fileDto.TransactionId,
                fileDto.FileName,
                fileBytes.Length,
                systemName => _storage.SaveAsync(systemName, fileBytes));
        }

        /// <summary>
        /// POST: /files/upload-form - загрузка файла через multipart/form-data (поля file и transactionId).
        /// Удобнее для фронтенда (FormData) и для проверки в Swagger (кнопка выбора файла) (admin, manager).
        /// </summary>
        [HttpPost("upload-form")]
        [Authorize(Roles = "admin,manager")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(MaxRequestSize)]
        public async Task<IActionResult> UploadFileForm([FromForm] UploadFileFormDto dto)
        {
            return await StoreFileAsync(
                dto.TransactionId,
                dto.File.FileName,
                dto.File.Length,
                systemName => _storage.SaveAsync(systemName, dto.File));
        }

        /// <summary>
        /// GET: /files/download/{id} - скачивание файла по id записи (любой авторизованный пользователь).
        /// </summary>
        [HttpGet("download/{id:int}")]
        public async Task<IActionResult> DownloadFileById(int id)
        {
            var record = await _context.TransactionFiles.AsNoTracking().FirstOrDefaultAsync(f => f.Id == id);
            return ServeFile(record);
        }

        /// <summary>
        /// POST: /files/download - скачивание файла по имени (любой авторизованный пользователь).
        /// </summary>
        [HttpPost("download")]
        public async Task<IActionResult> DownloadFile([FromBody] DownloadFileRequestDto request)
        {
            var (record, error) = await FindByNameAsync(request.FileName);
            if (error != null)
            {
                return error;
            }

            return ServeFile(record);
        }

        /// <summary>
        /// DELETE: /files/{id} - удаление файла по id записи (admin).
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteFileById(int id)
        {
            var record = await _context.TransactionFiles.FirstOrDefaultAsync(f => f.Id == id);
            if (record == null)
            {
                return NotFound(new { errorText = "Файл не найден" });
            }

            return await RemoveFileAsync(record);
        }

        /// <summary>
        /// DELETE: /files/delete - удаление файла по имени, тело запроса { "fileName": ... } (admin).
        /// </summary>
        [HttpDelete("delete")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteFile([FromBody] DeleteFileRequestDto request)
        {
            var (record, error) = await FindByNameAsync(request.FileName, track: true);
            if (error != null)
            {
                return error;
            }

            return await RemoveFileAsync(record!);
        }

        /// <summary>
        /// GET: /files/info/{systemName} - информация о файле (любой авторизованный пользователь).
        /// </summary>
        [HttpGet("info/{systemName}")]
        public async Task<IActionResult> GetFileInfo(string systemName)
        {
            var fileRecord = await _context.TransactionFiles
                .AsNoTracking()
                .Include(f => f.Transaction)
                .FirstOrDefaultAsync(f => f.SystemName == systemName);

            if (fileRecord == null)
            {
                return NotFound(new { errorText = "Файл не найден" });
            }

            return Ok(new
            {
                fileRecord.Id,
                fileRecord.SystemName,
                fileRecord.DisplayName,
                fileRecord.FileSize,
                fileRecord.UploadDate,
                Transaction = new
                {
                    fileRecord.Transaction.Id,
                    fileRecord.Transaction.Title,
                    fileRecord.Transaction.Amount,
                    fileRecord.Transaction.TransactionDate
                }
            });
        }

        /// <summary>
        /// GET: /files/transaction/{transactionId} - список файлов транзакции (любой авторизованный пользователь).
        /// </summary>
        [HttpGet("transaction/{transactionId}")]
        public async Task<IActionResult> GetTransactionFiles(int transactionId)
        {
            var files = await _context.TransactionFiles
                .AsNoTracking()
                .Where(f => f.TransactionId == transactionId)
                .OrderBy(f => f.UploadDate)
                .Select(f => new TransactionFileDto
                {
                    Id = f.Id,
                    DisplayName = f.DisplayName,
                    SystemName = f.SystemName,
                    FileSize = f.FileSize,
                    UploadDate = f.UploadDate
                })
                .ToListAsync();

            return Ok(files);
        }

        // ---------------------------------------------------------------------------------------

        private async Task<IActionResult> StoreFileAsync(int transactionId, string originalName, long size, Func<string, Task> writeToDisk)
        {
            // браузер/клиент может прислать полный путь - оставляем только имя файла
            var displayName = Path.GetFileName(originalName.Replace('\\', '/'));
            var extension = Path.GetExtension(displayName);

            if (string.IsNullOrWhiteSpace(displayName))
            {
                return BadRequest(new { errorText = "Не указано имя файла" });
            }

            if (!AllowedExtensions.Contains(extension))
            {
                return BadRequest(new { errorText = $"Недопустимый тип файла. Разрешены: {string.Join(", ", AllowedExtensions)}" });
            }

            if (size <= 0)
            {
                return BadRequest(new { errorText = "Файл пустой" });
            }

            if (size > MaxFileSize)
            {
                return BadRequest(new { errorText = $"Файл слишком большой. Максимум {MaxFileSize / 1024 / 1024} МБ" });
            }

            var transactionExists = await _context.Transactions.AnyAsync(t => t.Id == transactionId);
            if (!transactionExists)
            {
                return BadRequest(new { errorText = "Транзакция не найдена" });
            }

            var systemName = $"{Guid.NewGuid()}{extension.ToLowerInvariant()}";

            try
            {
                await writeToDisk(systemName);

                var transactionFile = new TransactionFile
                {
                    SystemName = systemName,
                    DisplayName = displayName,
                    FilePath = $"{FileStorage.FolderName}/{systemName}",
                    FileSize = size,
                    UploadDate = DateTime.UtcNow,
                    TransactionId = transactionId
                };

                _context.TransactionFiles.Add(transactionFile);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    fileId = transactionFile.Id,
                    systemName = systemName,
                    message = "Файл успешно загружен"
                });
            }
            catch
            {
                // не оставляем на диске файл (в т.ч. недописанный) без записи в БД
                _storage.DeleteIfExists(systemName);
                throw;
            }
        }

        /// <summary>
        /// Ищет файл по SystemName (уникален). Если такого нет - по DisplayName, но только когда он единственный:
        /// раньше выбиралась первая попавшаяся запись, и можно было скачать или удалить чужой файл с тем же именем.
        /// </summary>
        private async Task<(TransactionFile? Record, IActionResult? Error)> FindByNameAsync(string name, bool track = false)
        {
            IQueryable<TransactionFile> query = track
                ? _context.TransactionFiles
                : _context.TransactionFiles.AsNoTracking();

            var bySystemName = await query.FirstOrDefaultAsync(f => f.SystemName == name);
            if (bySystemName != null)
            {
                return (bySystemName, null);
            }

            var byDisplayName = await query.Where(f => f.DisplayName == name).Take(2).ToListAsync();
            if (byDisplayName.Count == 0)
            {
                return (null, NotFound(new { errorText = "Файл не найден" }));
            }

            if (byDisplayName.Count > 1)
            {
                return (null, Conflict(new { errorText = "Найдено несколько файлов с таким именем. Укажите системное имя (systemName) или используйте id." }));
            }

            return (byDisplayName[0], null);
        }

        private IActionResult ServeFile(TransactionFile? record)
        {
            if (record == null)
            {
                return NotFound(new { errorText = "Файл не найден" });
            }

            // путь строим из SystemName, а не из сохранённого FilePath (там могут быть пути чужого компьютера)
            var path = _storage.GetFullPath(record.SystemName);
            if (!System.IO.File.Exists(path))
            {
                return NotFound(new { errorText = "Файл не найден на сервере" });
            }

            if (!ContentTypes.TryGetContentType(record.DisplayName, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            return PhysicalFile(path, contentType, record.DisplayName);
        }

        private async Task<IActionResult> RemoveFileAsync(TransactionFile record)
        {
            var systemName = record.SystemName;

            _context.TransactionFiles.Remove(record);
            await _context.SaveChangesAsync();

            _storage.DeleteIfExists(systemName);

            return Ok(new { message = "Файл успешно удалён" });
        }
    }
}
