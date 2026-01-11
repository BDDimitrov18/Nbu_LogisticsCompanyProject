using DataLayer.Context;
using DataLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace DataLayer.Repositories.CompanyRepository;

public class CompanyRepository(LogisticsDbContext dbContext) : ICompanyRepository
{
    private readonly LogisticsDbContext _dbContext = dbContext;

    public async Task InsertAsync(Company company)
    {
        _dbContext.Companies.Add(company);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateAsync(Company company)
    {
        _dbContext.Companies.Update(company);
        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteAsync(Company company)
    {
        _dbContext.Companies.Remove(company);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<Company?> GetByIdAsync(int id)
    {
        return await _dbContext.Companies
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Company?> GetByNameAsync(string name)
    {
        return await _dbContext.Companies
            .FirstOrDefaultAsync(c => c.Name == name);
    }

    public async Task<IEnumerable<Company>> GetAllAsync()
    {
        return await _dbContext.Companies.ToListAsync();
    }
}
