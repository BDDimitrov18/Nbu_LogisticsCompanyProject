using DataLayer.DTOs.Create;
using DataLayer.DTOs.Edit;
using DataLayer.Entities;
using DataLayer.Repositories.CompanyRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistics.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompaniesController(ICompanyRepository companyRepository) : ControllerBase
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
            return BadRequest(new { Message = "Company with this name already exists" });
        }

        var company = new Company
        {
            Name = dto.Name
        };

        await companyRepository.InsertAsync(company);

        return CreatedAtAction(nameof(GetById), new { id = company.Id }, company);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CompanyDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(new { Message = "Id mismatch" });
        }

        var company = await companyRepository.GetByIdAsync(id);
        if (company == null)
        {
            return NotFound();
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

        await companyRepository.DeleteAsync(company);

        return NoContent();
    }
}
