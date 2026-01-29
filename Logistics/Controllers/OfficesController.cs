using DataLayer.DTOs.Create;
using DataLayer.DTOs.Edit;
using DataLayer.Entities;
using DataLayer.Repositories.OfficeRepository;
using Logistics.Services.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistics.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OfficesController(
    IOfficeRepository officeRepository,
    IUserAuthorizationService authService) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var office = await officeRepository.GetByIdAsync(id);
        if (office == null)
        {
            return NotFound();
        }

        return Ok(office);
    }

    [HttpGet("by-company/{companyId:int}")]
    public async Task<IActionResult> GetByCompanyId(int companyId)
    {
        var offices = await officeRepository.GetByCompanyIdAsync(companyId);
        return Ok(offices);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOfficeDto dto)
    {
        // Only admins can create offices
        var userId = authService.GetCurrentUserId();
        if (!await authService.IsAdminOfCompany(userId, dto.CompanyId))
        {
            return Forbid();
        }

        var office = new Office
        {
            CompanyId = dto.CompanyId,
            Location = dto.Location
        };

        await officeRepository.InsertAsync(office);

        return CreatedAtAction(nameof(GetById), new { id = office.Id }, office);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] OfficeDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(new { Message = "Несъответствие на ID" });
        }

        var office = await officeRepository.GetByIdAsync(id);
        if (office == null)
        {
            return NotFound();
        }

        // Only admins can update offices
        var userId = authService.GetCurrentUserId();
        if (!await authService.IsAdminOfCompany(userId, office.CompanyId))
        {
            return Forbid();
        }

        office.CompanyId = dto.CompanyId;
        office.Location = dto.Location;

        await officeRepository.UpdateAsync(office);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var office = await officeRepository.GetByIdAsync(id);
        if (office == null)
        {
            return NotFound();
        }

        // Only admins can delete offices
        var userId = authService.GetCurrentUserId();
        if (!await authService.IsAdminOfCompany(userId, office.CompanyId))
        {
            return Forbid();
        }

        await officeRepository.DeleteAsync(office);

        return NoContent();
    }
}
