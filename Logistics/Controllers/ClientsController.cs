using DataLayer.DTOs.Create;
using DataLayer.DTOs.Edit;
using DataLayer.Entities;
using DataLayer.Repositories.ClientRepository;
using Logistics.Services.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistics.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController(
    IClientRepository clientRepository,
    IUserAuthorizationService authService) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var client = await clientRepository.GetByIdAsync(id);
        if (client == null)
        {
            return NotFound();
        }

        var userId = authService.GetCurrentUserId();
        // User can see their own client record or if associated with the company
        if (client.UserId != userId && !await authService.IsAssociatedWithCompany(userId, client.CompanyId))
        {
            return Forbid();
        }

        return Ok(client);
    }

    [HttpGet("by-user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var currentUserId = authService.GetCurrentUserId();
        var clients = await clientRepository.GetByUserIdAsync(userId);

        // Users can see their own client records
        if (currentUserId == userId)
        {
            return Ok(clients);
        }

        // Others can only see client records for companies they're associated with
        var visibleClients = new List<Client>();
        foreach (var client in clients)
        {
            if (await authService.IsAssociatedWithCompany(currentUserId, client.CompanyId))
            {
                visibleClients.Add(client);
            }
        }

        return Ok(visibleClients);
    }

    [HttpGet("by-company/{companyId:int}")]
    public async Task<IActionResult> GetByCompanyId(int companyId)
    {
        var userId = authService.GetCurrentUserId();

        // Check if user is associated with this company
        if (!await authService.IsAssociatedWithCompany(userId, companyId))
        {
            return Forbid();
        }

        var clients = await clientRepository.GetByCompanyIdAsync(companyId);
        return Ok(clients);
    }

    // Internal method to create client (called from CargosController)
    // Clients should not be created manually from the Clients page
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClientDto dto)
    {
        // Check if user is already a client of this company
        var existingClients = await clientRepository.GetByUserIdAsync(dto.UserId);
        if (existingClients.Any(c => c.CompanyId == dto.CompanyId))
        {
            // Return the existing client instead of creating a new one
            var existingClient = existingClients.First(c => c.CompanyId == dto.CompanyId);
            return Ok(existingClient);
        }

        var client = new Client
        {
            UserId = dto.UserId,
            CompanyId = dto.CompanyId
        };

        await clientRepository.InsertAsync(client);

        return CreatedAtAction(nameof(GetById), new { id = client.Id }, client);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ClientDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(new { Message = "Несъответствие на ID" });
        }

        var client = await clientRepository.GetByIdAsync(id);
        if (client == null)
        {
            return NotFound();
        }

        // Only admins can update client records
        var userId = authService.GetCurrentUserId();
        if (!await authService.IsAdminOfCompany(userId, client.CompanyId))
        {
            return Forbid();
        }

        client.UserId = dto.UserId;
        client.CompanyId = dto.CompanyId;

        await clientRepository.UpdateAsync(client);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var client = await clientRepository.GetByIdAsync(id);
        if (client == null)
        {
            return NotFound();
        }

        var userId = authService.GetCurrentUserId();

        // Users can remove themselves as clients, or admins can remove any client
        bool canDelete = client.UserId == userId ||
                         await authService.IsAdminOfCompany(userId, client.CompanyId);

        if (!canDelete)
        {
            return Forbid();
        }

        await clientRepository.DeleteAsync(client);

        return NoContent();
    }
}
