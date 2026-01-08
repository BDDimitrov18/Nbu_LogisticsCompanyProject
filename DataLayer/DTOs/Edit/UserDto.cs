namespace DataLayer.DTOs.Edit;

public class UserDto
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public string? Username { get; set; } = null!;

    public string? Password { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string Email { get; set; } = null!;
}