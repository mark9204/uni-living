using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using UniLiving.DataContext;
using UniLiving.DataContext.Entities;

namespace UniLiving.Services.Services
{
    public interface ITokenService
    {
        Task<string> GenerateTokenAsync(int userId, TimeSpan validFor);
        Task<int?> ValidateTokenAsync(string token);
        Task<int?> ConsumeTokenAsync(string token);
        Task RevokeTokenAsync(string token);
    }

    public class TokenService : ITokenService
    {
        private readonly UniDBContext _context;

        public TokenService(UniDBContext context)
        {
            _context = context;
        }

        public async Task<string> GenerateTokenAsync(int userId, TimeSpan validFor)
        {
            var buffer = new byte[64]; // 512 bits
            RandomNumberGenerator.Fill(buffer);
            var token = Base64UrlEncode(buffer);
            var tokenHash = HashToken(token);

            var refreshToken = new RefreshToken
            {
                UserId = userId,
                TokenHash = tokenHash,
                ExpiresAt = DateTime.UtcNow.Add(validFor),
                IsRevoked = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync().ConfigureAwait(false);

            return token; // return plaintext token to client (store only hash)
        }

        public async Task<int?> ValidateTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return null;

            var tokenHash = HashToken(token);
            var rt = await _context.RefreshTokens
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.TokenHash == tokenHash && !x.IsDeleted)
                .ConfigureAwait(false);

            if (rt == null) return null;
            if (rt.IsRevoked || rt.ExpiresAt <= DateTime.UtcNow) return null;

            return rt.UserId;
        }

        public async Task<int?> ConsumeTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return null;

            var tokenHash = HashToken(token);
            var rt = await _context.RefreshTokens
                .FirstOrDefaultAsync(x => x.TokenHash == tokenHash && !x.IsDeleted)
                .ConfigureAwait(false);

            if (rt == null || rt.IsRevoked || rt.ExpiresAt <= DateTime.UtcNow)
                return null;

            rt.IsRevoked = true;
            rt.RevokedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync().ConfigureAwait(false);
            return rt.UserId;
        }

        public async Task RevokeTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return;

            var tokenHash = HashToken(token);
            var rt = await _context.RefreshTokens
                .FirstOrDefaultAsync(x => x.TokenHash == tokenHash && !x.IsDeleted)
                .ConfigureAwait(false);

            if (rt == null) return;

            rt.IsRevoked = true;
            rt.RevokedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync().ConfigureAwait(false);
        }

        private static string HashToken(string token)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(token);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        private static string Base64UrlEncode(byte[] data)
        {
            return Convert.ToBase64String(data).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        }
    }
}
