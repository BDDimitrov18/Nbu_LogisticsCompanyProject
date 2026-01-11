using DataLayer.Context;
using DataLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace DataLayer.Repositories.OfficeRepository;

public class OfficeRepository(LogisticsDbContext dbContext) : IOfficeRepository
{
    private readonly LogisticsDbContext _dbContext = dbContext;
    
    public async Task InsertAsync(Office office)
    {
        _dbContext.Offices.Add(office);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateAsync(Office office)
    {
        _dbContext.Offices.Update(office);
        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteAsync(Office office)
    {
        _dbContext.Offices.Remove(office);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<Office?> GetByIdAsync(int id)
    {
        return await _dbContext.Offices
            .FirstOrDefaultAsync(of => of.Id == id);
    }

    public async Task<IEnumerable<Office>> GetByCompanyIdAsync(int companyId)
    {
        return await _dbContext.Offices
            .Where(o => o.CompanyId == companyId)
            .ToListAsync();
    }
}