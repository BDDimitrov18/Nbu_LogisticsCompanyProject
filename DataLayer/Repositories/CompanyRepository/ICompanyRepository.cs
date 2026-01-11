using DataLayer.Entities;

namespace DataLayer.Repositories.CompanyRepository;

public interface ICompanyRepository
{
    Task InsertAsync(Company company);

    Task UpdateAsync(Company company);

    Task DeleteAsync(Company company);

    Task<Company?> GetByIdAsync(int id);

    Task<Company?> GetByNameAsync(string name);

    Task<IEnumerable<Company>> GetAllAsync();
}
