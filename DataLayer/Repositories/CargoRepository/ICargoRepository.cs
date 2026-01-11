using DataLayer.Entities;

namespace DataLayer.Repositories.CargoRepository;

public interface ICargoRepository
{
    Task InsertAsync(Cargo cargo);

    Task UpdateAsync(Cargo cargo);

    Task DeleteAsync(Cargo cargo);

    Task<Cargo?> GetByIdAsync(int id);

    Task<IEnumerable<Cargo>> GetByCompanyIdAsync(int companyId);

    Task<IEnumerable<Cargo>> GetBySenderIdAsync(int senderId);

    Task<IEnumerable<Cargo>> GetByRecieverIdAsync(int recieverId);

    Task<IEnumerable<Cargo>> GetByEmployeeIdAsync(int employeeId);

    Task<IEnumerable<Cargo>> GetByStatusAsync(CargoStatusEnum status);
}
