using DataLayer;
using DataLayer.DTOs.Create;
using DataLayer.DTOs.Edit;
using DataLayer.Entities;
using DataLayer.Repositories.CompanyRepository;
using DataLayer.Repositories.CompanyEmployeeRepository;
using DataLayer.Repositories.OfficeRepository;
using DataLayer.Repositories.ClientRepository;
using DataLayer.Repositories.CargoRepository;
using Logistics.Services.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistics.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompaniesController(
    ICompanyRepository companyRepository,
    ICompanyEmployeeRepository employeeRepository,
    IOfficeRepository officeRepository,
    IClientRepository clientRepository,
    ICargoRepository cargoRepository,
    IUserAuthorizationService authService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var companies = await companyRepository.GetAllAsync();
        return Ok(companies);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var company = await companyRepository.GetByIdAsync(id);
        if (company == null)
        {
            return NotFound();
        }

        return Ok(company);
    }

    [HttpGet("by-name/{name}")]
    public async Task<IActionResult> GetByName(string name)
    {
        var company = await companyRepository.GetByNameAsync(name);
        if (company == null)
        {
            return NotFound();
        }

        return Ok(company);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCompanyDto dto)
    {
        var existingCompany = await companyRepository.GetByNameAsync(dto.Name);
        if (existingCompany != null)
        {
            return BadRequest(new { Message = "Компания с това име вече съществува" });
        }

        var company = new Company
        {
            Name = dto.Name
        };

        await companyRepository.InsertAsync(company);

        // Create a default office for the company
        var office = new Office
        {
            CompanyId = company.Id,
            Location = "Главен офис"
        };
        await officeRepository.InsertAsync(office);

        // Make the creator an Admin of this company
        var userId = authService.GetCurrentUserId();
        var adminEmployee = new CompanyEmployee
        {
            UserId = userId,
            CompanyId = company.Id,
            OfficeId = office.Id,
            Role = EmployeeRoleEnum.Admin
        };
        await employeeRepository.InsertAsync(adminEmployee);

        return CreatedAtAction(nameof(GetById), new { id = company.Id }, company);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CompanyDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(new { Message = "Несъответствие на ID" });
        }

        var company = await companyRepository.GetByIdAsync(id);
        if (company == null)
        {
            return NotFound();
        }

        // Check if user is admin of this company
        var userId = authService.GetCurrentUserId();
        if (!await authService.IsAdminOfCompany(userId, id))
        {
            return Forbid();
        }

        company.Name = dto.Name;

        await companyRepository.UpdateAsync(company);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var company = await companyRepository.GetByIdAsync(id);
        if (company == null)
        {
            return NotFound();
        }

        // Check if user is admin of this company
        var userId = authService.GetCurrentUserId();
        if (!await authService.IsAdminOfCompany(userId, id))
        {
            return Forbid();
        }

        // Cascading delete in correct order (due to FK constraints):

        // 1. Delete all cargo for this company
        var cargos = await cargoRepository.GetByCompanyIdAsync(id);
        foreach (var cargo in cargos)
        {
            await cargoRepository.DeleteAsync(cargo);
        }

        // 2. Delete all clients for this company
        var companyClients = await clientRepository.GetByCompanyIdAsync(id);
        foreach (var client in companyClients)
        {
            await clientRepository.DeleteAsync(client);
        }

        // 3. Delete all employees for this company
        var companyEmployees = await employeeRepository.GetByCompanyIdAsync(id);
        foreach (var employee in companyEmployees)
        {
            await employeeRepository.DeleteAsync(employee);
        }

        // 4. Delete all offices for this company
        var offices = await officeRepository.GetByCompanyIdAsync(id);
        foreach (var office in offices)
        {
            await officeRepository.DeleteAsync(office);
        }

        // 5. Delete the company
        await companyRepository.DeleteAsync(company);

        // Note: Users are NOT deleted - they may have cargo in other companies
        // or may want to register with another company later

        return NoContent();
    }
}
