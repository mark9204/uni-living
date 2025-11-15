using System.ComponentModel.DataAnnotations;

namespace UniLiving.DataContext.DTOs
{
    public class RegisterRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [Range(2, 3, ErrorMessage = "Role must be either 2 (Landlord) or 3 (Tenant/Renter)")]
        public int RoleId { get; set; }
    }
}
