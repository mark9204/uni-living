using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using UniLiving.DataContext;
using UniLiving.DataContext.Entities;
using UniLiving.DataContext.DTOs;
using BCrypt.Net;
using Microsoft.Extensions.Configuration;

namespace UniLiving.Services.Services
{
    public interface IAuthenticationService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
        Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
        Task LogoutAsync(string refreshToken);
    }

    public class AuthenticationService : IAuthenticationService
    {
        private readonly UniDBContext _context;
        private readonly ITokenService _tokenService;
        private readonly string _jwtKey;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;
        private readonly int _jwtExpireMinutes;

        public AuthenticationService(
            UniDBContext context,
            ITokenService tokenService,
            IConfiguration configuration)
        {
            _context = context;
            _tokenService = tokenService;
            _jwtKey = configuration["Jwt:Key"] ?? throw new ArgumentNullException("Jwt:Key not configured");
            _jwtIssuer = configuration["Jwt:Issuer"] ?? throw new ArgumentNullException("Jwt:Issuer not configured");
            _jwtAudience = configuration["Jwt:Audience"] ?? throw new ArgumentNullException("Jwt:Audience not configured");
            _jwtExpireMinutes = int.Parse(configuration["Jwt:ExpireMinutes"] ?? "60");
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                throw new ArgumentException("Email and password are required");

            // Validate role selection (must be Landlord or Tenant/Renter)
            if (request.RoleId != 2 && request.RoleId != 3)
                throw new ArgumentException("Invalid role selection. Must be Landlord (2) or Tenant/Renter (3)");

            // Check if user already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (existingUser != null)
                throw new InvalidOperationException("User with this email already exists");

            // Create new user
            var user = new User
            {
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsActive = true,
                IsEmailVerified = false,
                RoleId = request.RoleId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Reload user with Role relationship
            user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == user.Id);

            // Generate tokens
            var accessToken = GenerateAccessToken(user);
            var refreshToken = await _tokenService.GenerateTokenAsync(
                user.Id,
                TimeSpan.FromDays(7));

            return new AuthResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn = _jwtExpireMinutes * 60
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                throw new ArgumentException("Email and password are required");

            // Find user by email
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !user.IsActive)
                throw new UnauthorizedAccessException("Invalid email or password");

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid email or password");

            // Generate tokens
            var accessToken = GenerateAccessToken(user);
            var refreshToken = await _tokenService.GenerateTokenAsync(
                user.Id,
                TimeSpan.FromDays(7));

            return new AuthResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn = _jwtExpireMinutes * 60
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                throw new ArgumentException("Refresh token is required");

            // Validate and consume refresh token
            var userId = await _tokenService.ConsumeTokenAsync(refreshToken);

            if (!userId.HasValue)
                throw new UnauthorizedAccessException("Invalid or expired refresh token");

            // Get user
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId.Value);

            if (user == null || !user.IsActive)
                throw new UnauthorizedAccessException("User not found or inactive");

            // Generate new tokens
            var newAccessToken = GenerateAccessToken(user);
            var newRefreshToken = await _tokenService.GenerateTokenAsync(
                user.Id,
                TimeSpan.FromDays(7));

            return new AuthResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                ExpiresIn = _jwtExpireMinutes * 60
            };
        }

        public async Task LogoutAsync(string refreshToken)
        {
            if (!string.IsNullOrWhiteSpace(refreshToken))
                await _tokenService.RevokeTokenAsync(refreshToken);
        }

        private string GenerateAccessToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "User")
            };

            var token = new JwtSecurityToken(
                issuer: _jwtIssuer,
                audience: _jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtExpireMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
