using DataLayer.Context;
using DataLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace DataLayer.Repositories.ClientRepository;

public class ClientRepository(LogisticsDbContext dbContext) : IClientRepository
{
    private readonly LogisticsDbContext _dbContext = dbContext;

    public async Task InsertAsync(Client client)
    {
        _dbContext.Clients.Add(client);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateAsync(Client client)
    {
        _dbContext.Clients.Update(client);
        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteAsync(Client client)
    {
        _dbContext.Clients.Remove(client);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<Client?> GetByIdAsync(int id)
    {
        return await _dbContext.Clients
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Client>> GetByUserIdAsync(int userId)
    {
        return await _dbContext.Clients
            .Where(c => c.UserId == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Client>> GetByCompanyIdAsync(int companyId)
    {
        return await _dbContext.Clients
            .Where(c => c.CompanyId == companyId)
            .ToListAsync();
    }
}
