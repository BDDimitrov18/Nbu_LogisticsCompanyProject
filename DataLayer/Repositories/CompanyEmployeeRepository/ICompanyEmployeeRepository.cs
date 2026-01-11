using DataLayer.Entities;

namespace DataLayer.Repositories.CompanyEmployeeRepository;

public interface ICompanyEmployeeRepository
{
    Task InsertAsync(CompanyEmployee employee);

    Task UpdateAsync(CompanyEmployee employee);

    Task DeleteAsync(CompanyEmployee employee);

    Task<CompanyEmployee?> GetByIdAsync(int id);

    Task<IEnumerable<CompanyEmployee>> GetByUserIdAsync(int userId);

    Task<IEnumerable<CompanyEmployee>> GetByCompanyIdAsync(int companyId);

    Task<IEnumerable<CompanyEmployee>> GetByOfficeIdAsync(int officeId);

    Task<IEnumerable<CompanyEmployee>> GetByRoleAsync(EmployeeRoleEnum role);
}
