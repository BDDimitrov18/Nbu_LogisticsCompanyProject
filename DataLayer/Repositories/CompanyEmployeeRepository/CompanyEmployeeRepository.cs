using DataLayer.Context;
using DataLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace DataLayer.Repositories.CompanyEmployeeRepository;

public class CompanyEmployeeRepository(LogisticsDbContext dbContext) : ICompanyEmployeeRepository
{
    private readonly LogisticsDbContext _dbContext = dbContext;

    public async Task InsertAsync(CompanyEmployee employee)
    {
        _dbContext.CompanyEmployees.Add(employee);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateAsync(CompanyEmployee employee)
    {
        _dbContext.CompanyEmployees.Update(employee);
        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteAsync(CompanyEmployee employee)
    {
        _dbContext.CompanyEmployees.Remove(employee);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<CompanyEmployee?> GetByIdAsync(int id)
    {
        return await _dbContext.CompanyEmployees
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<IEnumerable<CompanyEmployee>> GetByUserIdAsync(int userId)
    {
        return await _dbContext.CompanyEmployees
            .Where(e => e.UserId == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<CompanyEmployee>> GetByCompanyIdAsync(int companyId)
    {
        return await _dbContext.CompanyEmployees
            .Where(e => e.CompanyId == companyId)
            .ToListAsync();
    }

    public async Task<IEnumerable<CompanyEmployee>> GetByOfficeIdAsync(int officeId)
    {
        return await _dbContext.CompanyEmployees
            .Where(e => e.OfficeId == officeId)
            .ToListAsync();
    }

    public async Task<IEnumerable<CompanyEmployee>> GetByRoleAsync(EmployeeRoleEnum role)
    {
        return await _dbContext.CompanyEmployees
            .Where(e => e.Role == role)
            .ToListAsync();
    }
}
