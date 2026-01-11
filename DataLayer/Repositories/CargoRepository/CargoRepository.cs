using DataLayer.Context;
using DataLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace DataLayer.Repositories.CargoRepository;

public class CargoRepository(LogisticsDbContext dbContext) : ICargoRepository
{
    private readonly LogisticsDbContext _dbContext = dbContext;

    public async Task InsertAsync(Cargo cargo)
    {
        _dbContext.Cargos.Add(cargo);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateAsync(Cargo cargo)
    {
        _dbContext.Cargos.Update(cargo);
        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteAsync(Cargo cargo)
    {
        _dbContext.Cargos.Remove(cargo);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<Cargo?> GetByIdAsync(int id)
    {
        return await _dbContext.Cargos
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Cargo>> GetByCompanyIdAsync(int companyId)
    {
        return await _dbContext.Cargos
            .Where(c => c.CompanyId == companyId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Cargo>> GetBySenderIdAsync(int senderId)
    {
        return await _dbContext.Cargos
            .Where(c => c.SenderId == senderId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Cargo>> GetByRecieverIdAsync(int recieverId)
    {
        return await _dbContext.Cargos
            .Where(c => c.RecieverId == recieverId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Cargo>> GetByEmployeeIdAsync(int employeeId)
    {
        return await _dbContext.Cargos
            .Where(c => c.EmployeeId == employeeId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Cargo>> GetByStatusAsync(CargoStatusEnum status)
    {
        return await _dbContext.Cargos
            .Where(c => c.CargoStatus == status)
            .ToListAsync();
    }
}
