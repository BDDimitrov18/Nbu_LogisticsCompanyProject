using DataLayer.Entities;

namespace DataLayer.Repositories.ClientRepository;

public interface IClientRepository
{
    Task InsertAsync(Client client);

    Task UpdateAsync(Client client);

    Task DeleteAsync(Client client);

    Task<Client?> GetByIdAsync(int id);

    Task<IEnumerable<Client>> GetByUserIdAsync(int userId);

    Task<IEnumerable<Client>> GetByCompanyIdAsync(int companyId);
}
