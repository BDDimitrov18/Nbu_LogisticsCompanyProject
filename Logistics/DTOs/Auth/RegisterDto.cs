using System.ComponentModel.DataAnnotations;

namespace Logistics.DTOs.Auth;

public class RegisterDto
{
    public string? Name { get; set; }

    [Required]
    public string Username { get; set; } = null!;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = null!;

    [Required]
    [Phone]
    public string Phone { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
}
