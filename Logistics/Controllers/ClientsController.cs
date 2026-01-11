using DataLayer.DTOs.Create;
using DataLayer.DTOs.Edit;
using DataLayer.Entities;
using DataLayer.Repositories.ClientRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistics.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController(IClientRepository clientRepository) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var client = await clientRepository.GetByIdAsync(id);
        if (client == null)
        {
            return NotFound();
        }

        return Ok(client);
    }

    [HttpGet("by-user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var clients = await clientRepository.GetByUserIdAsync(userId);
        return Ok(clients);
    }

    [HttpGet("by-company/{companyId:int}")]
    public async Task<IActionResult> GetByCompanyId(int companyId)
    {
        var clients = await clientRepository.GetByCompanyIdAsync(companyId);
        return Ok(clients);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClientDto dto)
    {
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
            return BadRequest(new { Message = "Id mismatch" });
        }

        var client = await clientRepository.GetByIdAsync(id);
        if (client == null)
        {
            return NotFound();
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

        await clientRepository.DeleteAsync(client);

        return NoContent();
    }
}
