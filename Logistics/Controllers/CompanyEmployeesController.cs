using DataLayer;
using DataLayer.DTOs.Create;
using DataLayer.DTOs.Edit;
using DataLayer.Entities;
using DataLayer.Repositories.CompanyEmployeeRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistics.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompanyEmployeesController(ICompanyEmployeeRepository employeeRepository) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var employee = await employeeRepository.GetByIdAsync(id);
        if (employee == null)
        {
            return NotFound();
        }

        return Ok(employee);
    }

    [HttpGet("by-user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var employees = await employeeRepository.GetByUserIdAsync(userId);
        return Ok(employees);
    }

    [HttpGet("by-company/{companyId:int}")]
    public async Task<IActionResult> GetByCompanyId(int companyId)
    {
        var employees = await employeeRepository.GetByCompanyIdAsync(companyId);
        return Ok(employees);
    }

    [HttpGet("by-office/{officeId:int}")]
    public async Task<IActionResult> GetByOfficeId(int officeId)
    {
        var employees = await employeeRepository.GetByOfficeIdAsync(officeId);
        return Ok(employees);
    }

    [HttpGet("by-role/{role}")]
    public async Task<IActionResult> GetByRole(EmployeeRoleEnum role)
    {
        var employees = await employeeRepository.GetByRoleAsync(role);
        return Ok(employees);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCompanyEmployeeDto dto)
    {
        var employee = new CompanyEmployee
        {
            UserId = dto.UserId,
            CompanyId = dto.CompanyId,
            OfficeId = dto.OfficeId,
            Role = EmployeeRoleEnum.Office
        };

        await employeeRepository.InsertAsync(employee);

        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, employee);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CompanyEmployeeDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(new { Message = "Id mismatch" });
        }

        var employee = await employeeRepository.GetByIdAsync(id);
        if (employee == null)
        {
            return NotFound();
        }

        employee.UserId = dto.UserId;
        employee.CompanyId = dto.CompanyId;
        employee.OfficeId = dto.OfficeId;

        await employeeRepository.UpdateAsync(employee);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var employee = await employeeRepository.GetByIdAsync(id);
        if (employee == null)
        {
            return NotFound();
        }

        await employeeRepository.DeleteAsync(employee);

        return NoContent();
    }
}
