using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Logistics.DTOs.Auth;
using DataLayer.Entities;
using DataLayer.Repositories.UserRepository;
using Logistics.Services.PasswordHasher;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace Logistics.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(
    IUserRepository userRepository,
    IPasswordHasherService passwordHasher,
    IConfiguration configuration) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        var existingUser = await userRepository.GetByUsernameAsync(registerDto.Username);
        if (existingUser != null)
        {
            return BadRequest(new { Message = "Username already exists" });
        }

        var existingEmail = await userRepository.GetUserByEmailAsync(registerDto.Email);
        if (existingEmail != null)
        {
            return BadRequest(new { Message = "Email already exists" });
        }

        var user = new User
        {
            Name = registerDto.Name,
            Username = registerDto.Username,
            Password = passwordHasher.HashPassword(registerDto.Password),
            Phone = registerDto.Phone,
            Email = registerDto.Email
        };

        await userRepository.InsertAsync(user);

        return Ok(new { Message = "User registered successfully" });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var user = await userRepository.GetByUsernameAsync(loginDto.Username);
        if (user == null)
        {
            return Unauthorized(new { Message = "Invalid username or password" });
        }

        if (!passwordHasher.VerifyPassword(loginDto.Password, user.Password))
        {
            return Unauthorized(new { Message = "Invalid username or password" });
        }

        var token = GenerateJwtToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Expiration = DateTime.UtcNow.AddHours(3)
        });
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(configuration["JWT:Secret"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: configuration["JWT:ValidIssuer"],
            audience: configuration["JWT:ValidAudience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(3),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
