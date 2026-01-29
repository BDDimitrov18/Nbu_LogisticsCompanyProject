using DataLayer.DTOs.Create;
using DataLayer.DTOs.Edit;
using DataLayer.Entities;
using DataLayer.Repositories.UserRepository;
using Logistics.Services.PasswordHasher;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistics.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(
    IUserRepository userRepository,
    IPasswordHasherService passwordHasher) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await userRepository.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpGet("by-email/{email}")]
    public async Task<IActionResult> GetByEmail(string email)
    {
        var user = await userRepository.GetUserByEmailAsync(email);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        var existingUser = await userRepository.GetByUsernameAsync(dto.Username);
        if (existingUser != null)
        {
            return BadRequest(new { Message = "Потребителското име вече съществува" });
        }

        var existingEmail = await userRepository.GetUserByEmailAsync(dto.Email);
        if (existingEmail != null)
        {
            return BadRequest(new { Message = "Имейл адресът вече съществува" });
        }

        var user = new User
        {
            Name = dto.Name,
            Username = dto.Username,
            Password = passwordHasher.HashPassword(dto.Password),
            Phone = dto.Phone,
            Email = dto.Email
        };

        await userRepository.InsertAsync(user);

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UserDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(new { Message = "Несъответствие на ID" });
        }

        var user = await userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        user.Name = dto.Name ?? user.Name;
        user.Username = dto.Username ?? user.Username;
        user.Phone = dto.Phone;
        user.Email = dto.Email;

        if (!string.IsNullOrEmpty(dto.Password))
        {
            user.Password = passwordHasher.HashPassword(dto.Password);
        }

        await userRepository.UpdateAsync(user);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        await userRepository.DeleteAsync(user);

        return NoContent();
    }
}
