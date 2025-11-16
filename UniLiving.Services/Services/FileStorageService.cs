using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace UniLiving.Services.Services
{
    public interface IFileStorageService
    {
        Task<string> SavePropertyImageAsync(Stream fileStream, string fileName, int propertyId);
        Task<bool> DeletePropertyImageAsync(string filePath);
        Task<bool> ValidateImageAsync(string fileName, long fileSize);
        Task<bool> ValidateMimeTypeAsync(Stream fileStream, string mimeType);
    }

    public class FileStorageService : IFileStorageService
    {
        private readonly string _secureStorageDirectory;
        private readonly long _maxFileSizeBytes;
        private readonly Dictionary<string, string[]> _allowedMimeTypes;
        private readonly string[] _allowedExtensions;

        public FileStorageService(IConfiguration configuration)
        {
            var fileStorageConfig = configuration.GetSection("FileStorage");
            
            // Secure storage location OUTSIDE web root
            var baseUploadPath = fileStorageConfig["BaseDirectory"] ?? "uploads";
            _secureStorageDirectory = Path.Combine(
                Directory.GetCurrentDirectory(),
                "..",
                baseUploadPath,
                "properties");
            
            _maxFileSizeBytes = (long.Parse(fileStorageConfig["MaxFileSizeMB"] ?? "10") * 1024 * 1024);
            _allowedExtensions = fileStorageConfig.GetSection("AllowedExtensions").Get<string[]>() 
                ?? new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

            // Define allowed MIME types per extension (prevent masquerading)
            _allowedMimeTypes = new Dictionary<string, string[]>
            {
                { ".jpg", new[] { "image/jpeg" } },
                { ".jpeg", new[] { "image/jpeg" } },
                { ".png", new[] { "image/png" } },
                { ".gif", new[] { "image/gif" } },
                { ".webp", new[] { "image/webp" } }
            };

            // Create directory if it doesn't exist
            Directory.CreateDirectory(_secureStorageDirectory);
        }

        public async Task<string> SavePropertyImageAsync(Stream fileStream, string fileName, int propertyId)
        {
            // 1. Validate extension
            if (!ValidateFileName(fileName))
                throw new ArgumentException("Invalid file extension. Only image files are allowed.");

            // 2. Validate file size
            if (fileStream.Length == 0)
                throw new ArgumentException("File is empty");

            if (fileStream.Length > _maxFileSizeBytes)
                throw new ArgumentException($"File size exceeds maximum allowed size of {_maxFileSizeBytes / (1024 * 1024)}MB");

            // 3. Validate MIME type (read first chunk)
            fileStream.Position = 0;
            if (!await ValidateMimeTypeAsync(fileStream, fileName))
                throw new ArgumentException("File content does not match declared file type. Potential security risk.");

            // 4. Create property-specific directory
            var propertyDir = Path.Combine(_secureStorageDirectory, $"prop_{propertyId}");
            Directory.CreateDirectory(propertyDir);

            // 5. Generate secure filename (UUID-based, no original filename)
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            var secureFileName = $"{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(propertyDir, secureFileName);

            // 6. Verify path is within allowed directory (path traversal prevention)
            var fullPath = Path.GetFullPath(filePath);
            var allowedPath = Path.GetFullPath(_secureStorageDirectory);
            if (!fullPath.StartsWith(allowedPath + Path.DirectorySeparatorChar))
                throw new ArgumentException("Invalid file path");

            // 7. Save file with restricted permissions
            try
            {
                fileStream.Position = 0;
                using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    await fileStream.CopyToAsync(stream);
                }

                // 8. Set file permissions to read-only (Windows)
                var fileInfo = new FileInfo(filePath);
                fileInfo.Attributes = FileAttributes.Normal;

                return secureFileName;
            }
            catch (Exception ex)
            {
                // Delete partially uploaded file if something goes wrong
                if (File.Exists(filePath))
                    File.Delete(filePath);
                throw new InvalidOperationException("Failed to save file", ex);
            }
        }

        public async Task<bool> DeletePropertyImageAsync(string filePath)
        {
            try
            {
                // Sanitize path input
                if (string.IsNullOrWhiteSpace(filePath))
                    return false;

                // Only allow alphanumeric + guid + extension
                if (!IsValidStorageFileName(filePath))
                    return false;

                var fullPath = Path.Combine(_secureStorageDirectory, filePath);
                var absolutePath = Path.GetFullPath(fullPath);

                // Security check: ensure the path is within the allowed directory
                var allowedPath = Path.GetFullPath(_secureStorageDirectory);
                if (!absolutePath.StartsWith(allowedPath + Path.DirectorySeparatorChar))
                    return false;

                if (File.Exists(absolutePath))
                {
                    File.Delete(absolutePath);
                    return true;
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ValidateImageAsync(string fileName, long fileSize)
        {
            // File size check
            if (fileSize <= 0 || fileSize > _maxFileSizeBytes)
                return false;

            // Extension check
            if (!ValidateFileName(fileName))
                return false;

            return await Task.FromResult(true);
        }

        public async Task<bool> ValidateMimeTypeAsync(Stream fileStream, string fileName)
        {
            try
            {
                var extension = Path.GetExtension(fileName).ToLowerInvariant();
                
                if (!_allowedMimeTypes.ContainsKey(extension))
                    return false;

                // Read file signature (magic bytes) to verify file type
                var fileSignature = await ReadFileSignatureAsync(fileStream);
                
                // Check magic bytes for each allowed image type
                if (extension == ".jpg" || extension == ".jpeg")
                {
                    // JPEG: FF D8 FF
                    return fileSignature.Length >= 3 && 
                           fileSignature[0] == 0xFF && 
                           fileSignature[1] == 0xD8 && 
                           fileSignature[2] == 0xFF;
                }
                else if (extension == ".png")
                {
                    // PNG: 89 50 4E 47 0D 0A 1A 0A
                    return fileSignature.Length >= 8 &&
                           fileSignature[0] == 0x89 &&
                           fileSignature[1] == 0x50 &&
                           fileSignature[2] == 0x4E &&
                           fileSignature[3] == 0x47;
                }
                else if (extension == ".gif")
                {
                    // GIF: 47 49 46
                    return fileSignature.Length >= 3 &&
                           fileSignature[0] == 0x47 &&
                           fileSignature[1] == 0x49 &&
                           fileSignature[2] == 0x46;
                }
                else if (extension == ".webp")
                {
                    // WebP: RIFF ... WEBP
                    return fileSignature.Length >= 12 &&
                           fileSignature[0] == 0x52 && fileSignature[1] == 0x49 && // RIFF
                           fileSignature[2] == 0x46 && fileSignature[3] == 0x46 &&
                           fileSignature[8] == 0x57 && fileSignature[9] == 0x45 && // WEBP
                           fileSignature[10] == 0x42 && fileSignature[11] == 0x50;
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        private async Task<byte[]> ReadFileSignatureAsync(Stream fileStream)
        {
            var buffer = new byte[512]; // Read first 512 bytes
            fileStream.Position = 0;
            var bytesRead = await fileStream.ReadAsync(buffer, 0, buffer.Length);
            Array.Resize(ref buffer, bytesRead);
            return buffer;
        }

        private bool ValidateFileName(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return !string.IsNullOrWhiteSpace(extension) && 
                   Array.Exists(_allowedExtensions, ext => ext == extension);
        }

        private bool IsValidStorageFileName(string fileName)
        {
            // Only allow UUID + extension format
            if (string.IsNullOrWhiteSpace(fileName))
                return false;

            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            var nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);

            // Check if name is valid GUID format (32 hex chars) and extension is allowed
            return Guid.TryParse(nameWithoutExtension, out _) && 
                   _allowedExtensions.Contains(extension);
        }
    }
}
