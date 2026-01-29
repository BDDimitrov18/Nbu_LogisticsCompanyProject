using DataLayer;
using DataLayer.DTOs.Create;
using DataLayer.DTOs.Edit;
using DataLayer.Entities;
using DataLayer.Repositories.CompanyEmployeeRepository;
using Logistics.Services.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistics.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompanyEmployeesController(
    ICompanyEmployeeRepository employeeRepository,
    IUserAuthorizationService authService) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var employee = await employeeRepository.GetByIdAsync(id);
        if (employee == null)
        {
            return NotFound();
        }

        // Check if user is associated with this company
        var userId = authService.GetCurrentUserId();
        if (!await authService.IsAssociatedWithCompany(userId, employee.CompanyId))
        {
            return Forbid();
        }

        return Ok(employee);
    }

    [HttpGet("by-user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        // Users can only see their own employee records, or admins can see any
        var currentUserId = authService.GetCurrentUserId();
        if (currentUserId != userId)
        {
            // Check if current user is admin of any company this user is in
            var employees = await employeeRepository.GetByUserIdAsync(userId);
            var visibleEmployees = new List<CompanyEmployee>();

            foreach (var emp in employees)
            {
                if (await authService.IsAssociatedWithCompany(currentUserId, emp.CompanyId))
                {
                    visibleEmployees.Add(emp);
                }
            }
            return Ok(visibleEmployees);
        }

        var result = await employeeRepository.GetByUserIdAsync(userId);
        return Ok(result);
    }

    [HttpGet("by-company/{companyId:int}")]
    public async Task<IActionResult> GetByCompanyId(int companyId)
    {
        // Check if user is associated with this company
        var userId = authService.GetCurrentUserId();
        if (!await authService.IsAssociatedWithCompany(userId, companyId))
        {
            return Forbid();
        }

        var employees = await employeeRepository.GetByCompanyIdAsync(companyId);
        return Ok(employees);
    }

    [HttpGet("by-office/{officeId:int}")]
    public async Task<IActionResult> GetByOfficeId(int officeId)
    {
        var employees = await employeeRepository.GetByOfficeIdAsync(officeId);

        // Filter to only companies the user is associated with
        var userId = authService.GetCurrentUserId();
        var visibleEmployees = new List<CompanyEmployee>();

        foreach (var emp in employees)
        {
            if (await authService.IsAssociatedWithCompany(userId, emp.CompanyId))
            {
                visibleEmployees.Add(emp);
            }
        }

        return Ok(visibleEmployees);
    }

    [HttpGet("by-role/{role}")]
    public async Task<IActionResult> GetByRole(EmployeeRoleEnum role)
    {
        var employees = await employeeRepository.GetByRoleAsync(role);

        // Filter to only companies the user is associated with
        var userId = authService.GetCurrentUserId();
        var visibleEmployees = new List<CompanyEmployee>();

        foreach (var emp in employees)
        {
            if (await authService.IsAssociatedWithCompany(userId, emp.CompanyId))
            {
                visibleEmployees.Add(emp);
            }
        }

        return Ok(visibleEmployees);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCompanyEmployeeDto dto)
    {
        // Only admins can create employees for their company
        var userId = authService.GetCurrentUserId();
        if (!await authService.IsAdminOfCompany(userId, dto.CompanyId))
        {
            return Forbid();
        }

        // Check if user is already an employee of this company
        var existingEmployees = await employeeRepository.GetByUserIdAsync(dto.UserId);
        if (existingEmployees.Any(e => e.CompanyId == dto.CompanyId))
        {
            return BadRequest(new { Message = "Потребителят вече е служител в тази компания" });
        }

        var employee = new CompanyEmployee
        {
            UserId = dto.UserId,
            CompanyId = dto.CompanyId,
            OfficeId = dto.OfficeId,
            Role = dto.Role
        };

        await employeeRepository.InsertAsync(employee);

        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, employee);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CompanyEmployeeDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(new { Message = "Несъответствие на ID" });
        }

        var employee = await employeeRepository.GetByIdAsync(id);
        if (employee == null)
        {
            return NotFound();
        }

        // Only admins can update employee records
        var userId = authService.GetCurrentUserId();
        if (!await authService.IsAdminOfCompany(userId, employee.CompanyId))
        {
            return Forbid();
        }

        employee.OfficeId = dto.OfficeId;
        employee.Role = dto.Role;

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

        var userId = authService.GetCurrentUserId();

        // Users can delete their own record, or admins can delete any
        bool canDelete = employee.UserId == userId ||
                         await authService.IsAdminOfCompany(userId, employee.CompanyId);

        if (!canDelete)
        {
            return Forbid();
        }

        await employeeRepository.DeleteAsync(employee);

        return NoContent();
    }
}
