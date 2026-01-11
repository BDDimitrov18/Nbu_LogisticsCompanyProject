using DataLayer.Entities;

namespace DataLayer.Repositories.OfficeRepository;

public interface IOfficeRepository
{
    public Task InsertAsync(Office office);
    
    public Task UpdateAsync(Office office);
    
    public Task DeleteAsync(Office office);
    
    Task<Office?> GetByIdAsync(int id);

    Task<IEnumerable<Office>> GetByCompanyIdAsync(int companyId);
}